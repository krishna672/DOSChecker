
# Denial of Service (DoS) Monitor

## Overview
The Denial of Service (DoS) Monitor is a web-based tool designed to monitor the status of ports on a specified server in real-time. It enables users to input the IP address and ports they wish to monitor for potential DoS attacks. The tool continuously checks the status of these ports and visualizes the data using a real-time chart.

## Features
- **Port Monitoring**: Users can input the IP address and ports to be monitored.
- **Real-time Chart**: Displays the status of monitored ports in real-time using a line chart.
- **Stop Monitoring**: Provides an option to stop the monitoring process.
- **Output Data Logging**: Logs output data from port monitoring to files for analysis and record-keeping.

## File Structure
- **public/index.html**: HTML file containing the user interface for the monitoring tool.
- **public/script.js**: JavaScript file responsible for WebSocket communication, chart rendering, and user interactions.
- **server.js**: Node.js script setting up the Express.js server and WebSocket server for communication with the client-side application.
- **backend.py**: Python script used to check the status of ports on the specified server.
- **logs/**: logs for DOS monitor are stored.
![Local Image](images/local_image.png)

## Dependencies
### Frontend Dependencies
- **Chart.js**: Library used for rendering real-time charts.
- **Moment.js**: Library for handling date and time formats.

### Backend Dependencies
- **Node.js**: JavaScript runtime environment for running server-side scripts.
- **Express.js**: Web application framework for Node.js used to set up the HTTP server.
- **WebSocket**: Library for WebSocket communication between client and server.
- **fs**: Node.js module for file system operations.
- **child_process**: Node.js module for spawning child processes.
- **socket**: Python module for socket programming.

## Setup
1. **Clone the Repository**: Download the zip file for the NodeJS Application.
2. **Install Dependencies**:
     ```
     cd path/to/repository
     npm install
     ```
	 ![Local Image](images/npminstall.png)
3. **Run the Application**:
   - Start the Node.js server:
     ```
     node server.js
     ```
   - Open `http://localhost:3000` in a web browser.

## Usage
1. **Input IP and Ports**: Enter the IP address and ports of the server you want to monitor in the provided input fields.
2. **Start Monitoring**: Click on the "Check Port" button to start monitoring the specified ports.
3. **Stop Monitoring**: To stop the monitoring process, click on the "Stop Monitor" button.
4. **View Real-time Chart**: The chart on the page visualizes the status of monitored ports in real-time.

## Logging Output Data
- Output data from port monitoring is logged to files for analysis and record-keeping.
- Files are named with timestamps and stored in the `logs` directory.


