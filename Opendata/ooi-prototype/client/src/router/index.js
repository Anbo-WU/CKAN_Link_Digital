import { createRouter, createWebHistory } from 'vue-router';
import InviteHandlerView from '../views/InviteHandlerView.vue';
import StatsView from '../views/StatsView.vue';
import NotFoundView from '../views/NotFoundView.vue';
import AboutView from '../views/AboutView.vue';
import NetworkView from '../views/NetworkView.vue';

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            // Route for handling invites 
            path: '/invite/:token',
            name: 'inviteHandler', // New name
            component: InviteHandlerView,
            // No props needed directly from route, component fetches using token
        },
        {
            // Route for displaying stats
            path: '/stats/:odaiId', // Expecting ODAI ID in the path
            name: 'stats',
            component: StatsView,
            props: true // Pass route params as props to the component
        },
        {
            path: '/network', // Define the path for the network view
            name: 'networkView',
            component: NetworkView
        },

        // A placeholder home route
        {
            path: '/',
            name: 'home',
            component: () => import('../views/HomeView.vue') // Create a simple HomeView
        },

        // route for the About page
        {
            path: '/about',
            name: 'about',
            component: AboutView
        },
        // Catch-all 404
        {
            path: '/:pathMatch(.*)*',
            name: 'NotFound',
            component: NotFoundView
        },


    ]
});

export default router;