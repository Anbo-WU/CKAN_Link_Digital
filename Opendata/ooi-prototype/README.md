# OOI Experiment Prototype 

## Project Overview

This folder contains the source code for a web prototype developed as part of the **Objective Observer Initiative (OOI)** conceptual framework. 

The prototype demonstrates the core mechanics of an OOI experiment focused on mapping social connections and lineage through shared invite links. It allows users to join an experiment, receive a unique identifier, obtain a shareable invite link/QR code, and optionally submit basic demographic data. The system tracks the lineage of invitations, allowing for the visualization and analysis of emergent network structures.


## Live Deployment

A live version of this prototype is currently deployed and accessible at:

**[https://www.opendata.bar](https://www.opendata.bar)**


## Features Implemented

*   **Experiment Joining:** Users can join Experiment '01' via a unique invite link or the initial landing page.
*   **Unique Identifiers:** Each participant receives a unique `#ODAI-XXXX` identifier.
*   **Invitation Mechanism:** Participants receive a unique invitation token embedded in a shareable URL and QR code.
*   **Lineage Tracking:** The backend tracks direct and indirect invitations, calculating lineage depth.
*   **Statistics View:** Participants can view basic statistics related to their position in the network (Direct Invites, Total Network size, Lineage Depth, Lineage Path).
*   **IP Address Logging:** The backend captures the IP address upon joining.
*   **Optional Demographics:** Participants can optionally submit Gender, Age, and Geolocation (Latitude/Longitude) after joining.
*   **QR Code Generation:** Dynamic QR code generation for easy sharing of invite links.
*   **Responsive Design:** Basic responsiveness for different screen sizes.


## Technology Stack

*   **Frontend:** Vue.js (v3), Vite, Vue Router, Axios, qrcode.vue
*   **Backend:** Node.js, Express.js, mysql2, cors, dotenv, uuid, request-ip
*   **Database:** MySQL (using POINT type for location)
*   **IDE:** VS Code


## Local Development Setup

Follow these steps to set up and run the prototype on your local machine for development or testing.

**Prerequisites:**

*   [Node.js](https://nodejs.org/) (includes npm) - Preferably LTS version or higher.
*   [MySQL Server](https://dev.mysql.com/downloads/mysql/) installed and running.
*   [VS Code](https://code.visualstudio.com/) (Recommended IDE).

**Steps:**

1.  **Clone the Repository**

2.  **Database Setup:**
    
    *   The default configuration uses the database hosted at https://www.opendata.bar, but you can also create your own local database using the CreateTables.sql file.
  
3.  **Backend Setup (`server/` directory):**
    *   Navigate to the backend directory: `cd server`
    *   Install backend dependencies: `npm install`
    *   Start the backend development server: `npm run dev`

4.  **Frontend Setup (`client/` directory):**
    *   Open a **new terminal** and navigate to the frontend directory: `cd client`.
    *   Install frontend dependencies: `npm install`
    *   Start the frontend development server: `npm run dev`

5.  **Access the Application:**
    *   Open your web browser and navigate to `http://localhost:5173` .
    *   You should see the homepage. The "Start Observation" button/QR code should now be dynamically linked using the token fetched from the backend corresponding to `#ODAI-INIT`.
    *   Test the joining process, demographics submission, stats view, etc.
