<template>
    <div class="view-container network-view-container">
        <div class="content-box network-content-box">
            <h1>Experiment 01 Network Graph</h1>

            <div v-if="isLoading" class="loading-message">Loading network data...</div>
            <div v-if="errorMsg" class="error-message">{{ errorMsg }}</div>

            <!-- Vis Network Container -->
            <div ref="networkContainer" class="network-graph-container"></div>

            <!-- Optional: Display selected node info -->
            <div v-if="selectedNodeInfo" class="selected-node-info">
                <h2>Selected: {{ selectedNodeInfo.label }} {{ selectedNodeInfo.isRoot ? '(Root)' : '' }}</h2>
                <!-- Display stats fetched for the selected node -->
                <div v-if="selectedNodeStatsLoading" class="loading-message">Loading stats...</div>
                <div v-if="selectedNodeStatsError" class="error-message">{{ selectedNodeStatsError }}</div>
                <div v-if="selectedNodeStats" class="stats-grid">
                    <div class="stats-label">Direct Invites</div>
                    <div class="stats-value">{{ selectedNodeStats.directInvites ?? 'N/A' }}</div>
                    <div class="stats-label">Total Network</div>
                    <div class="stats-value">{{ selectedNodeStats.totalNetwork ?? 'N/A' }}</div>
                    <div class="stats-label">Lineage Depth</div>
                    <div class="stats-value">{{ selectedNodeStats.lineageDepth ?? 'N/A' }}</div>
                    <!-- Add more stats as needed -->
                </div>
                <!-- Subtree Controls (only if node has children) -->
                <div v-if="childMap.get(selectedNodeInfo.id)?.length > 0" class="subtree-controls">
                    <button @click="toggleSubtree(selectedNodeInfo.id, false)"
                        class="action-link expand-collapse-btn">Expand All Below</button>
                    <button @click="toggleSubtree(selectedNodeInfo.id, true)"
                        class="action-link expand-collapse-btn">Collapse All Below</button>
                </div>
                <router-link :to="{ name: 'stats', params: { odaiId: selectedNodeInfo.label.substring(1) } }"
                    class="action-link" target="_blank">
                    View Full Stats
                </router-link>
            </div>


            <div class="navigation-links">
                <router-link to="/" class="action-link">Back to Start</router-link>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, shallowRef, reactive, computed } from 'vue';
import { Network, DataSet } from 'vis-network/standalone'; // Import vis-network
import { fetchNetworkData, fetchStats } from '../services/apiService';

// Refs
const networkContainer = ref(null); // Ref for the container div
const visNetwork = shallowRef(null); // To hold the vis network instance (use shallowRef for non-reactive objects)
const isLoading = ref(true);
const errorMsg = ref('');
// --- Node Selection State ---
const selectedNodeInfo = ref(null); // Info of the clicked node
const selectedNodeStats = ref(null); // Stats for the clicked node
const selectedNodeStatsLoading = ref(false);
const selectedNodeStatsError = ref('');
// --- Define Root and Default Colors ---
const defaultNodeColor = { border: '#00ff00', background: '#222222' };
const rootNodeColor = { border: '#FFD700', background: '#FFA500' }; // Gold/Orange

// --- Original Full Network Data ---
const allNodes = ref([]); // Store the complete node list from API
const allEdges = ref([]); // Store the complete edge list from API

// --- State for Collapsed Nodes ---
// Use a Set for efficient add/delete/has checks
const collapsedNodes = reactive(new Set()); // Stores IDs of collapsed parent nodes

// --- DataSets for Vis.js (Reactive) ---
// These will hold the *filtered* data shown in the graph
const visibleNodes = new DataSet();
const visibleEdges = new DataSet();

// Vis Network Options
const networkOptions = {
    nodes: {
        shape: 'dot', // Use dots for nodes
        // size defined by data from backend
        font: {
            color: '#ffffff', // White label
            size: 12,
            face: 'Consolas, Monaco, monospace'
        },
        borderWidth: 2,
        // Set default color here (will be overridden by processed node data)
        color: defaultNodeColor,
    },
    edges: {
        width: 1,
        color: {
            color: '#848484',
            highlight: '#00ff00',
            hover: '#cccccc',
            inherit: 'from', // Edge color can be inherited
            opacity: 1.0
        },
        arrows: {
            to: { enabled: true, scaleFactor: 0.5 } // Smaller arrows
        },
        smooth: { // Smoother curves for edges
            type: 'cubicBezier',
            forceDirection: 'vertical',
            roundness: 0.4
        }
    },
    physics: {
        // enable physics for layout stabilization after initial load
        // barnesHut: {
        //     gravitationalConstant: -8000,
        //     springConstant: 0.04,
        //     springLength: 150
        // },
        // stabilization: { iterations: 150 },
        enabled: true, // Keep physics enabled for interaction
        solver: 'forceAtlas2Based', // Good algorithm
        forceAtlas2Based: {
            gravitationalConstant: -300,
            centralGravity: 0.001,
            springLength: 30, // Slightly longer default length?
            springConstant: 0.8, // Slightly weaker spring?
            damping: 0.9, // Slightly higher damping?
            avoidOverlap: 0.99, // Adjust to prevent node overlap
        },
        minVelocity: 5,
        // Stabilization options can often be removed if fixing nodes,
        // as the layout will adjust dynamically. Keep if needed for initial load.
        stabilization: { // Stabilize quickly on load
            enabled: true,
            iterations: 200, // Number of iterations for stabilization
            updateInterval: 10,
            fit: true // Fit after stabilization
        },
    },
    interaction: {
        hover: true, // Show hover effects
        tooltipDelay: 200,
        navigationButtons: true, // Show zoom/fit buttons
        keyboard: true
    },
    layout: {
        hierarchical: false,
        // Hierarchical layout can be an alternative
        // hierarchical: {
        //     enabled: false, // Set true to use
        //     direction: 'UD', // Up-Down
        //     sortMethod: 'directed'
        // }
    }
};

// --- Helper: Build Adjacency List (Child Map) ---
// Creates a map where keys are parent node IDs and values are arrays of their direct children IDs
const childMap = computed(() => {
    const map = new Map();
    allEdges.value.forEach(edge => {
        if (!map.has(edge.from)) {
            map.set(edge.from, []);
        }
        map.get(edge.from).push(edge.to);
    });
    console.log("Child map created:", map);
    return map;
});

// --- Helper: Get All Descendants (Recursive) ---
function getAllDescendants(nodeId, currentChildMap) {
    const descendants = new Set();
    const queue = [nodeId]; // Start with the node itself
    // We don't add the starting node itself to descendants unless needed
    // queue.shift(); // remove starting node if only pure descendants wanted

    const nodesToProcess = [nodeId]; // Stack for DFS-like traversal

    while (nodesToProcess.length > 0) {
        const currentId = nodesToProcess.pop();
        const children = currentChildMap.get(currentId) || [];
        children.forEach(childId => {
            if (!descendants.has(childId)) { // Avoid cycles causing infinite loops
                descendants.add(childId);
                nodesToProcess.push(childId);
            }
        });
    }
    return descendants;
}

// --- Function to Update Visible Data ---
function updateVisibleData() {
    if (!visNetwork.value || allNodes.value.length === 0) return;

    console.log("Updating visible data. Collapsed nodes:", collapsedNodes);
    const newVisibleNodeIds = new Set();
    const nodesToAdd = [];
    const edgesToAdd = [];

    // 1. Start with root nodes and their direct children (unless root is collapsed)
    allNodes.value.forEach(node => {
        if (node.isRoot) {
            if (!newVisibleNodeIds.has(node.id)) {
                newVisibleNodeIds.add(node.id);
                nodesToAdd.push(node); // Add root node
            }
            // Add direct children of root unless the root is collapsed
            if (!collapsedNodes.has(node.id)) {
                const children = childMap.value.get(node.id) || [];
                children.forEach(childId => {
                    if (!newVisibleNodeIds.has(childId)) {
                        newVisibleNodeIds.add(childId);
                    }
                });
            }
        }
    });

    // 2. Recursively add children of expanded nodes
    // This needs careful implementation to avoid adding children of collapsed parents
    // Let's refine: Iterate all nodes, add if parent is visible and NOT collapsed
    const nodesToPotentiallyAdd = new Set(allNodes.value.map(n => n.id));
    const finalVisibleNodeIds = new Set();

    allNodes.value.forEach(node => {
        if (node.isRoot) {
            finalVisibleNodeIds.add(node.id); // Roots are always potentially visible
        }
    });

    let changed = true;
    while (changed) { // Keep iterating until no new nodes are added
        changed = false;
        const currentlyVisible = new Set(finalVisibleNodeIds); // Snapshot

        allEdges.value.forEach(edge => {
            // If the parent ('from') is visible AND it's not collapsed
            if (currentlyVisible.has(edge.from) && !collapsedNodes.has(edge.from)) {
                // And the child ('to') is not already marked as visible
                if (!finalVisibleNodeIds.has(edge.to)) {
                    finalVisibleNodeIds.add(edge.to);
                    changed = true; // Mark that we added a node
                }
            }
        });
    }


    // 3. Prepare nodes and edges arrays based on finalVisibleNodeIds
    const finalNodesToAdd = allNodes.value.filter(node => finalVisibleNodeIds.has(node.id))
        .map(node => ({
            ...node,
            // Add visual cue for collapsed nodes?
            // Example: different border if collapsed and has children
            borderWidth: (collapsedNodes.has(node.id) && (childMap.value.get(node.id)?.length || 0) > 0) ? 4 : 2,
            color: collapsedNodes.has(node.id)
                ? { border: '#FF8C00', background: '#555' } // DarkOrange border / Grey bg for collapsed
                : (node.isRoot ? rootNodeColor : defaultNodeColor)
        }));

    const finalEdgesToAdd = allEdges.value.filter(edge =>
        finalVisibleNodeIds.has(edge.from) && finalVisibleNodeIds.has(edge.to)
    );

    console.log(`Updating Vis DataSet: ${finalNodesToAdd.length} nodes, ${finalEdgesToAdd.length} edges`);

    // 4. Update Vis DataSet (efficiently handles updates)
    visibleNodes.update(finalNodesToAdd);
    // Remove nodes that are no longer visible
    const currentVisNodeIds = visibleNodes.getIds();
    const nodesToRemove = currentVisNodeIds.filter(id => !finalVisibleNodeIds.has(id));
    if (nodesToRemove.length > 0) {
        console.log("Removing nodes:", nodesToRemove);
        visibleNodes.remove(nodesToRemove);
    }

    visibleEdges.clear(); // Clear existing edges
    visibleEdges.add(finalEdgesToAdd); // Add only the visible ones

    // Optional: Trigger layout stabilization after update
    // if (visNetwork.value?.stabilize) {
    //     visNetwork.value.stabilize();
    // }
}

// --- Function to Toggle Node Collapse/Expand ---
function toggleNode(nodeId) {
    if (!nodeId || !childMap.value.has(nodeId)) {
        console.log(`Node ${nodeId} has no children to toggle.`);
        return; // Cannot collapse/expand leaf nodes or nodes without children
    };

    console.log(`Toggling node ${nodeId}`);
    if (collapsedNodes.has(nodeId)) {
        collapsedNodes.delete(nodeId); // Expand
    } else {
        collapsedNodes.add(nodeId); // Collapse
    }
    updateVisibleData(); // Refresh the graph display
}

// --- Expand/Collapse All Below Node ---
function toggleSubtree(nodeId, collapse = true) {
    if (!nodeId) return;
    const descendants = getAllDescendants(nodeId, childMap.value);
    const nodesToToggle = [nodeId, ...descendants]; // Include the node itself and all descendants

    console.log(`${collapse ? 'Collapsing' : 'Expanding'} subtree starting from ${nodeId}`);

    nodesToToggle.forEach(id => {
        // Only toggle nodes that actually have children
        if (childMap.value.has(id)) {
            if (collapse) {
                collapsedNodes.add(id);
            } else {
                collapsedNodes.delete(id);
            }
        }
    });
    updateVisibleData();
}

// --- Event Handler for Double Click ---
function handleDoubleClick(params) {
    if (params.nodes && params.nodes.length > 0) {
        const nodeId = params.nodes[0];
        toggleNode(nodeId);
    }
}

// --- Handler for Drag End ---
function handleDragEnd(params) {
    if (params.nodes && params.nodes.length > 0) {
        console.log(`DragEnd event for nodes: ${params.nodes.join(', ')}`);

        // Get the final positions of the dragged nodes from the vis instance
        const positions = visNetwork.value.getPositions(params.nodes);
        console.log('Final positions:', positions);

        const updates = params.nodes.map(nodeId => {
             // Check if position data exists for the node
             if (positions[nodeId]) {
                return {
                    id: nodeId,
                    // Update the x, y coordinates in the DataSet
                    // This makes the dropped position the new starting point for physics
                    x: positions[nodeId].x,
                    y: positions[nodeId].y,
                    // DO NOT set fixed: true here
                    // fixed: false // Ensure fixed is false if it was ever set true previously
                };
             }
             return null; // Return null if position couldn't be retrieved
        }).filter(update => update !== null); // Filter out any null updates


        if (updates.length > 0) {
            // Update the nodes in the DataSet with their new positions
            try {
                console.log("Updating node positions in DataSet:", updates);
                visibleNodes.update(updates);
            } catch (error) {
                 console.error("Error updating node positions:", error)
            }
        }

         // Optional: Slightly 'wake up' physics after drag if needed, but usually not required
         if (visNetwork.value) {
            visNetwork.value.startSimulation();
            setTimeout(() => visNetwork.value.stopSimulation(), 50); // Run briefly
         }
    }
    // If the drag involved pointer movement but ended without selecting nodes (rare)
    // Or handle edge dragging if relevant
    else if (params.event.type === 'pointerup') {
         console.log("DragEnd without nodes selected (likely canvas drag).");
    }
}

// Fetch network data and initialize vis network
onMounted(async () => {
    isLoading.value = true;
    errorMsg.value = '';
    try {
        console.log('NetworkView: Fetching network data...');
        const response = await fetchNetworkData('01'); // Fetch data for experiment '01'

        if (!response.data || !response.data.nodes || !response.data.edges) {
            throw new Error("Invalid network data received from server.");
        }

        // --- Process nodes data BEFORE passing to Vis ---
        const processedNodes = response.data.nodes.map(node => ({
            ...node, // Keep existing properties (id, label, size, title, x, y, isRoot)
            // Set color based on the isRoot flag received from backend
            color: node.isRoot ? rootNodeColor : defaultNodeColor
        }));
        // ---------------------------------------------

        // Store complete data
        allNodes.value = processedNodes;
        allEdges.value = response.data.edges;
        console.log(`NetworkView: Stored ${allNodes.value.length} nodes and ${allEdges.value.length} edges.`);

        // --- Initial Collapse State ---
        console.log("Setting initial collapse state...");
        allNodes.value.forEach(node => {
            // Collapse everything EXCEPT root nodes initially
            if (!node.isRoot && childMap.value.has(node.id)) {
                collapsedNodes.add(node.id);
            }
        });
        console.log("Initial collapsed set:", collapsedNodes);
        // --- End Initial Collapse ---

        if (networkContainer.value) {
            console.log('NetworkView: Initializing Vis Network...');
            // Initialize with the DataSet objects
            const initialData = { nodes: visibleNodes, edges: visibleEdges };
            visNetwork.value = new Network(networkContainer.value, initialData, networkOptions);

            // --- Add Event Listener for Clicks ---
            visNetwork.value.on('click', handleNetworkClick);
            visNetwork.value.on('doubleClick', handleDoubleClick);
            visNetwork.value.on('dragEnd', handleDragEnd);

            // Populate DataSet AFTER network is initialized
            updateVisibleData();

            // Fit view after initial population might be better
            visNetwork.value.once('stabilized', () => {
                console.log("Initial layout stabilized, fitting view.");
                // Optional: Fit view after initial stabilization
                // visNetwork.value.fit();
            });

            console.log('NetworkView: Vis Network Initialized.');
        } else {
            throw new Error("Network container element not found.");
        }

    } catch (error) {
        console.error('NetworkView: Error loading network data:', error);
        errorMsg.value = `Failed to load network graph: ${error.message}`;
    } finally {
        isLoading.value = false;
    }
});

// Cleanup vis network instance when component unmounts
onBeforeUnmount(() => {
    if (visNetwork.value) {
        console.log('NetworkView: Destroying Vis Network instance.');
        visNetwork.value.off('click', handleNetworkClick);
        visNetwork.value.off('doubleClick', handleDoubleClick);
        visNetwork.value.off('dragEnd', handleDragEnd);
        visNetwork.value.destroy();
        visNetwork.value = null;
    }
});

// --- Handle Clicks on Nodes ---
const handleNetworkClick = async (params) => {
    selectedNodeStats.value = null; // Clear previous stats
    selectedNodeStatsError.value = '';
    selectedNodeInfo.value = null;

    if (params.nodes && params.nodes.length > 0) {
        const nodeId = params.nodes[0]; // Get the clicked node ID (which is the DB ID as string)
        const nodeData = visNetwork.value.body.data.nodes.get(nodeId); // Get node data from vis dataset

        if (nodeData) {
            console.log('Node clicked:', nodeData);
            selectedNodeInfo.value = nodeData; // Store basic info {id, label, size, title, x, y}

            // Fetch detailed stats for the clicked node
            selectedNodeStatsLoading.value = true;
            try {
                // Assuming nodeData.label is the #ODAI-XXXX ID
                const statsResponse = await fetchStats(nodeData.label);
                selectedNodeStats.value = statsResponse.data;
                console.log("Fetched stats for selected node:", selectedNodeStats.value);
            } catch (error) {
                console.error(`Error fetching stats for node ${nodeData.label}:`, error);
                selectedNodeStatsError.value = `Could not load stats for ${nodeData.label}.`;
                selectedNodeStats.value = null;
            } finally {
                selectedNodeStatsLoading.value = false;
            }
        }
    } else {
        console.log('Canvas clicked (no node).');
        // Clear selection if clicking the background
        selectedNodeInfo.value = null;
        selectedNodeStats.value = null;
    }
}

</script>

<style scoped>
/* Inherit base styles */

.network-view-container {
    justify-content: flex-start;
    padding-top: 1px;
    /* Align content top */
}

.network-content-box {
    width: 100%;
    max-width: 1200px;
    /* Allow wider container for graph */
    padding: 20px;
    padding-top: 1px;
    box-sizing: border-box;
}

h1 {
    color: #ff0;
    /* Yellow */
    text-align: center;
    margin-top: 1px;
    margin-bottom: 15px;
}

p {
    text-align: center;
    margin-bottom: 30px;
    color: #ccc;
}

.network-graph-container {
    width: 100%;
    /* Height is crucial for vis-network */
    height: 65vh;
    /* Use viewport height, adjust as needed */
    min-height: 500px;
    /* Minimum height */
    border: 1px solid #00ff00;
    /* Green border around the graph */
    background-color: #050505;
    /* Slightly off-black background */
    margin-bottom: 20px;
    position: relative;
    /* Needed if using absolute positioning inside */
}

.selected-node-info {
    margin-top: 20px;
    padding: 15px;
    border: 1px solid #555;
    border-radius: 5px;
    background-color: rgba(34, 34, 34, 0.5);
    /* Dark semi-transparent */
    text-align: left;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
}

.selected-node-info h2 {
    margin-top: 0;
    margin-bottom: 15px;
    color: #0ff;
    /* Cyan for selected node title */
    font-size: 1.4em;
    padding-bottom: 10px;
    border-bottom: 1px solid #444;
}

/* Reuse stats grid styles from StatsView if possible, or redefine */
.selected-node-info .stats-grid {
    display: grid;
    grid-template-columns: max-content 1fr;
    gap: 5px 15px;
    font-size: 0.95em;
    margin-bottom: 15px;
}

.selected-node-info .stats-label {
    color: #aaa;
    font-weight: bold;
}

.selected-node-info .stats-value {
    color: #eee;
}

.selected-node-info .action-link {
    margin-top: 10px;
    font-size: 0.9em;
    padding: 6px 12px;
}


.navigation-links {
    margin-top: 30px;
    text-align: center;
}

/* --- New Styles --- */
.selected-node-info .action-link {
    margin-top: 10px;
    margin-right: 10px;
    /* Space between buttons */
    font-size: 0.9em;
    padding: 5px 10px;
}

.subtree-controls {
    margin-top: 15px;
    padding-top: 10px;
    border-top: 1px solid #444;
}

.expand-collapse-btn {
    background-color: rgba(80, 80, 80, 0.3);
    border-color: #888;
    color: #ccc;
}

.expand-collapse-btn:hover {
    background-color: rgba(100, 100, 100, 0.4);
    border-color: #aaa;
    color: #fff;
}

.view-stats-btn {
    /* Use default action-link style */
    color: inherit;
}
</style>

<style>
/* Global styles for vis-network specific elements if needed */
.vis-navigation .vis-button {
    background-color: rgba(0, 255, 0, 0.2) !important;
    border: 1px solid #0f0 !important;
    color: #0f0 !important;
}

.vis-navigation .vis-button:hover {
    background-color: rgba(0, 255, 0, 0.4) !important;
    box-shadow: none !important;
}

/* Tooltip styling */
div.vis-tooltip {
    background-color: #111 !important;
    border: 1px solid #0f0 !important;
    color: #eee !important;
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace !important;
    padding: 8px !important;
    border-radius: 4px !important;
    box-shadow: 0 2px 5px rgba(0, 255, 0, 0.3) !important;
    white-space: pre-wrap !important;
    /* Allow line breaks from title */
}
</style>