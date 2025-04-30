### Invitation Network Visualization - Implementation Summary

**1. Overview**

This document summarizes the technical implementation of the invitation network visualization feature for the OOI Experiment Prototype. The goal is to provide a visual representation of the participant invitation graph, highlighting key network properties and allowing user interaction.

**2. Architecture**

The implementation follows a client-server architecture:

*   **Backend (Node.js/Express):** Responsible for fetching raw participant data, processing it into a graph structure, calculating relevant network metrics (e.g., centrality), applying an initial layout, and serving this data via a dedicated API endpoint.
*   **Frontend (Vue.js/Vite):** Responsible for fetching the prepared graph data from the backend API, rendering the interactive network graph using a visualization library, handling user interactions (zoom, pan, drag, click, double-click), and displaying relevant information about selected nodes or the overall graph.

**3. Backend Implementation Details**

*   **Key Libraries:**
    *   `express`: Web framework for creating the API endpoint.
    *   `mysql2`: Database driver for interacting with the MySQL database.
    *   `graphology`: Core library for creating and manipulating graph structures in JavaScript.
    *   `graphology-metrics`: Used for calculating network metrics (specifically `centrality.outDegree`).
    *   `graphology-layout-forceatlas2`: Used for applying an initial force-directed layout to the graph data before sending it to the frontend (optional but helpful for initial placement).
*   **API Endpoint:**
    *   `GET /api/network/:experimentId?`: Fetches network data for a given experiment ID (defaults to '01').
*   **Data Processing Logic (`getNetworkGraph` controller):**
    *   Fetches all participant records (`id`, `odai_id`, `invited_by_participant_id`) for the experiment from the database (`getAllParticipantsForNetwork` model function).
    *   Constructs a `graphology` directed graph instance.
    *   Adds nodes to the graph, mapping database `id` to the graph node key and storing `odai_id` as a label. Identifies and flags root nodes (`isRoot: true`).
    *   Adds directed edges based on the `invited_by_participant_id` relationships.
    *   Calculates the out-degree for each node using `metrics.centrality.outDegree` and stores it as a node attribute.
    *   (Optional) Applies an initial layout using `forceAtlas2.assign` for a limited number of iterations.
    *   Formats the graph data into `nodes` and `edges` arrays suitable for `vis-network`:
        *   Nodes include `id`, `label`, calculated `size` (based on out-degree), `title` (tooltip), initial `x`, `y` coordinates, the `isRoot` flag, and potentially pre-defined `color` objects based on `isRoot`.
        *   Edges include `from`, `to`, and `arrows: 'to'`.
*   **Algorithms:**
    *   **Out-Degree Centrality:** Simple count of outgoing edges per node.
    *   **ForceAtlas2:** A force-directed graph layout algorithm used for initial node positioning.

**4. Frontend Implementation Details**

*   **Key Libraries:**
    *   `Vue.js (v3)`: Core frontend framework.
    *   `Vue Router`: For navigating to the network view page.
    *   `axios`: For making API requests to the backend.
    *   `vis-network/standalone`: The primary library used for rendering and interacting with the network graph.
    *   `js-cookie`: (Used in `InviteHandlerView`, not directly in network view but part of the overall invite flow).
*   **Component:** `NetworkView.vue`
*   **Data Fetching:** Calls a dedicated service function (`fetchNetworkData` in `apiService.js`) which hits the backend `/api/network/:experimentId` endpoint on component mount (`onMounted`).
*   **Visualization Rendering:**
    *   Initializes a `vis-network` `Network` instance, attaching it to a `div` element (`ref="networkContainer"`).
    *   Uses `vis-network`'s reactive `DataSet` objects (`visibleNodes`, `visibleEdges`) to manage the graph data being displayed.
    *   Processes the fetched node data to apply specific styling (e.g., root node color) *before* adding it to the `visibleNodes` DataSet (preferred approach for Separation of Concerns).
*   **Layout & Physics:** Configures `vis-network` options (`networkOptions`) to enable physics (using `forceAtlas2Based` or `barnesHut` solver) for dynamic layout and stabilization.
*   **Interaction Handling:**
    *   **Zoom/Pan:** Enabled via default `vis-network` interaction options.
    *   **Node Dragging:** Enabled by default. The `dragEnd` event listener updates the node's position (`x`, `y`) in the `visibleNodes` DataSet, making it "stick" while still allowing subsequent drags.
    *   **Node Click:** The `click` event listener fetches detailed stats for the selected node using the existing `/api/stats/:odaiId` endpoint (`fetchStats` service) and displays them.
    *   **Node Double-Click:** The `doubleClick` event listener triggers the `toggleNode` function.
*   **Expand/Collapse Logic:**
    *   Maintains a `Set` (`collapsedNodes`) of node IDs whose children should be hidden.
    *   The `updateVisibleData` function filters the `allNodes` and `allEdges` based on the `collapsedNodes` set and updates the `visibleNodes` and `visibleEdges` DataSets.
    *   The `toggleNode` function adds/removes a node ID from the `collapsedNodes` Set.
    *   The `toggleSubtree` function expands/collapses all descendants of a selected node.
    *   Nodes are visually styled (e.g., border/color) to indicate their collapsed state if they have hidden children.
*   **Styling:** Uses scoped CSS and potentially global CSS overrides (`<style>`) for `vis-network` elements (tooltips, navigation buttons) to match the application's theme.

**5. Data Flow Summary**

1.  Frontend (`NetworkView`) mounts -> Calls `fetchNetworkData` service.
2.  Service (`apiService.js`) -> Hits Backend `GET /api/network/:experimentId`.
3.  Backend (`experimentController.js`) -> Calls `getAllParticipantsForNetwork` model.
4.  Model (`participantModel.js`) -> Queries MySQL database.
5.  Backend -> Processes data using `graphology`, calculates metrics, formats nodes/edges.
6.  Backend -> Returns JSON `{ nodes: [...], edges: [...] }` to Frontend.
7.  Frontend -> Processes received nodes (applies root color), populates `visibleNodes` and `visibleEdges` DataSets.
8.  `vis-network` -> Renders the graph based on the DataSets.
9.  User interacts (click, double-click, drag) -> Event listeners trigger updates to `collapsedNodes` Set or call `fetchStats` API -> `updateVisibleData` refreshes the graph DataSets -> `vis-network` updates the view.
