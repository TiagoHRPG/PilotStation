# PilotStation

PilotStation is a web-based ground control station for drones, focused on indoor flights. It provides a modern, user-friendly interface for monitoring, controlling, and analyzing drone flights in real-time.

## Features

### Core Functionality
- **Multi-Drone Support**: Connect and control multiple drones simultaneously.
- **Real-time Telemetry**: Monitor essential flight data, including position, attitude, and battery status.
- **Command Interface**: Send commands to drones with confirmation feedback.
- **Parameter Management**: View and modify drone parameters with rich metadata.

### Visualization
- **3D Map View**: Visualize drone position and orientation in a 3D environment.
- **Trajectory Tracking**: See flight paths with color-coded trajectories for each drone.
- **Multiple Camera Controls**: Zoom, pan, and orbit around your drone fleet.
- **Heading Indicator**: Visual representation of drone orientation.

### Flight Logging
- **Comprehensive Logging**: Automatically logs all flight data, commands, and events.
- **Log Browser**: View, filter, and analyze past flight logs.
- **Downloadable Logs**: Export logs for offline analysis.
- **Event Timeline**: Track drone events throughout a flight.

### User Interface
- **Responsive Design**: Works on desktop and tablet devices.
- **Real-time Updates**: All data is updated in real-time.
- **Customizable Layout**: Arrange interface components to suit your workflow.

## Architecture

PilotStation consists of two main components:
- **Frontend (React/TypeScript)**: The web interface that users interact with.
- **Backend (Python)**: Handles communication with drones via MAVLink and manages data storage.

## Getting Started

### Prerequisites
- **Node.js** (v16+)
- **Python** (v3.9+)
- **Git**

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-repo/PilotStation.git
   cd PilotStation
   ```

2. **Backend Setup**
   - Navigate to the backend directory and follow the instructions in its README file.
    ```
    cd backend
    ```
    - Install dependencies:
    ```
    python -m venv venv
    
    # On Linux/Mac:
    source venv/bin/activate
    # On Windows:
    .\venv\Scripts\activate

    pip install -r requirements.txt
    ```
    - Start the backend server
    ```
    .venv/bin/python3 -m uvicorn main:app 
    ```

3. **Frontend Setup**
   - Navigate to the `pilot-frontend` directory:
     ```bash
     cd pilot-frontend
     ```
   - Install dependencies:
     ```bash
     npm install
     ```
   - Start the development server:
     ```bash
     npm run dev
     ```
   - The frontend should now be running at [http://localhost:5173](http://localhost:5173) and will automatically connect to the backend at [http://localhost:8000](http://localhost:8000).

## Usage Guide

### Connecting to a Drone
1. From the dashboard, click **"Add Drone"**.
2. Enter the drone's connection string (e.g., `127.0.0.1:14550` for SITL).
3. Click **"Connect"**.
4. Once connected, the drone will appear in the dashboard and on the 3D map.

### Viewing Drone Parameters
1. Click on a connected drone to open its detail view.
2. Navigate to the **"Parameters"** tab.
3. Use the search feature to find specific parameters.
4. Edit parameters by clicking the **"Edit"** button.

### Using the 3D Map
- **Zoom**: Mouse wheel or pinch gesture.
- **Rotate**: Click and drag.
- **Pan**: Right-click and drag.
- **Reset View**: Click the **"Reset View"** button in the lower right.

### Viewing Flight Logs
1. Click **"View Flight Logs"** from the dashboard.
2. Browse available logs by date and drone.
3. Click **"View"** to analyze a specific log.
4. Use filters to focus on specific event types.

## Development

### Project Structure
```
/PilotStation
│
├── backend/                # Python backend
│   ├── api/               # API endpoints
│   ├── core/              # Core functionality 
│   │   ├── services/      # Business logic
│   │   ├── models/        # Data models
│   │   └── logging/       # Logging system
│   └── main.py           # Entry point
│
└── pilot-frontend/        # React frontend
    ├── src/              
    │   ├── components/    # UI components
    │   ├── drone/         # Drone-specific components
    │   ├── map/           # 3D map visualization
    │   ├── parameters/    # Parameter management
    │   ├── logs/          # Log viewing components
    │   ├── services/      # API client services
    │   └── store/         # State management
    └── public/            # Static assets
```

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## Acknowledgments
- Built with **React**, **TypeScript**, and **Vite**.
- 3D visualization powered by **Three.js** and **React Three Fiber**.
- Uses **MAVLink** for drone communication.