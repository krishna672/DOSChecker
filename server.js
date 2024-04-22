const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { spawn } = require('child_process');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static('public'));
app.use(express.json()); // Middleware to parse JSON requests

// Store references to Python processes
const pythonProcesses = [];

// Endpoint to save output data to a file
app.post('/saveOutputData', (req, res) => {
    const { outputData } = req.body;
    if (!outputData) {
        return res.status(400).send('Output data is missing');
    }

    // Generate filename with current date and time (in DOS format)
    const now = new Date();
    const filename = `logs/${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}_DOS.log`;

    // Save output data to the generated filename
    fs.appendFile(filename, outputData + '\n', (err) => {
        if (err) {
            console.error('Error saving output data:', err);
            return res.status(500).send('Error saving output data');
        }
        console.log('Output data saved successfully');
        res.sendStatus(200);
    });
});

// Function to pad single digits with leading zeros
function pad(num) {
    return num.toString().padStart(2, '0');
}

wss.on('connection', (ws) => {
    console.log('WebSocket connection established');

    ws.on('message', (message) => {
        console.log('Received message:', message); // Debug print
        try {
            const parsedMessage = JSON.parse(message);

            if (parsedMessage.stop) {
                if (pythonProcesses.length > 0) {
                    console.log('Received stop message');
                    // Terminate all Python processes
                    pythonProcesses.forEach(process => {
                        process.kill();
                    });
                    pythonProcesses.length = 0; // Clear the pythonProcesses array
                } else {
                    console.log('No Python process to stop');
                }
                return;
            }

            const { ip, ports } = parsedMessage;
            console.log(`Received request to check ports ${ports.join(',')} on ${ip}`);

            // Spawn separate Python processes for each port
            ports.forEach(port => {
                const pythonProcess = spawn('python', ['backend.py', ip, port], {
                    stdio: ['pipe', 'pipe', 'pipe', 'ipc'] // Allows sending signals to the child process
                });
                pythonProcesses.push(pythonProcess); // Store reference to the Python process

                pythonProcess.stdout.on('data', (data) => {
                    const outputMessage = `${data.toString()}`;
                    // Send message to the WebSocket connection
                    ws.send(outputMessage);
                });

                pythonProcess.stderr.on('data', (data) => {
                    console.error(`Error executing Python script: ${data}`);
                    const errorMessage = `[${new Date().toLocaleString()}] Error executing Python script: ${data}`;
                    // Send error message to the WebSocket connection
                    ws.send(errorMessage);
                });

                pythonProcess.on('close', (code) => {
                    console.log(`Python script for port ${port} finished execution with code ${code}`);
                });
            });
        } catch (error) {
            console.error('Error parsing message:', error);
            const errorMessage = `[${new Date().toLocaleString()}] Error parsing message: ${error}`;
            // Send error message to the WebSocket connection
            ws.send(errorMessage);
        }
    });

    ws.on('close', () => {
        console.log('WebSocket connection closed');
    });
});

server.listen(3000, () => {
    console.log('WebSocket server listening on port 3000');
});
