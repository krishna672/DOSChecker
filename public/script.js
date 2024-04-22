const socket = new WebSocket('ws://localhost:3000');
let chartData = {}; // Object to store data for each port
let myChart;
let refreshInterval;
let pythonProcess;
let outputData = ''; // Variable to store output data

socket.addEventListener('open', function (event) {
    //console.log('WebSocket connection established');
});

document.getElementById("portForm").addEventListener("submit", function(event) {
    event.preventDefault();
    const ip = document.getElementById("ip").value;
    const ports = document.getElementById("ports").value.split(' '); // Split ports by space

    socket.send(JSON.stringify({ ip, ports })); // Send IP and ports as an array

    // Initialize chartData for each port
    ports.forEach(port => {
        chartData[port] = [];
    });
});

// Keep track of active Python processes
const activeProcesses = [];

// Event listener for stop button click
document.getElementById("stopButton").addEventListener("click", function() {
    // Send a stop message to the WebSocket server
    const stopMessage = JSON.stringify({ stop: true });
    socket.send(stopMessage);

    // Optionally, you can display a message to indicate that the processes are stopping
    console.log("Stopping processes...");

    // Send output data to the server when stopping
    sendOutputDataToServer();
});

function handleMessage(event) {
    // Store data in the outputData variable
    outputData += event.data;

    // Extract port, time, and status from the message
    const [port, timestamp, status] = extractPortTimeStatus(event.data);

    // Add data to the chart dataset for the port
    chartData[port].push({ time: timestamp, status: status });

    // Update chart for the received port
    updateChart(port);

    // Push the Python process to activeProcesses array
    activeProcesses.push(event.pythonProcess);
}

// Add the 'message' event listener
socket.addEventListener('message', handleMessage);

let colorIndex = 0;
const darkColors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'];

function getRandomColor() {
    const color = darkColors[colorIndex];
    colorIndex = (colorIndex + 1) % darkColors.length;
    return color;
}
let portColors = {}; // Object to store assigned colors for each port

function updateChart() {
    const canvas = document.getElementById('myChart');
    const ctx = canvas.getContext('2d');

    if (!myChart) {
        // Initialize new chart if it doesn't exist
        myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: []
            },
            options: {
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'second'
                        },
                        ticks: {
                            maxTicksLimit: 10 // Limit maximum number of ticks on x-axis
                        }
                    },
                    y: {
                        min: 0,
                        max: 1,
                        ticks: {
                            stepSize: 1,
                            callback: function(value, index, values) {
                                return value === 1 ? 'Open' : 'Closed'; // Convert numerical values to 'Open' and 'Closed'
                            }
                        }
                    }
                }
            }
        });
    }

    // Clear previous data
    myChart.data.datasets = [];

    // Update chart with data for each port
    Object.keys(chartData).forEach((port, index) => {
        // Assign color for the port if not already assigned
        if (!portColors[port]) {
            portColors[port] = getRandomColor();
        }
        
        myChart.data.datasets.push({
            label: `Port ${port}`,
            data: chartData[port].map(entry => ({ x: entry.time, y: entry.status === 'open' ? 1 : 0 })),
            borderColor: portColors[port],
            fill: false
        });
    });

    // Update chart
    myChart.update();
}

function extractPortTimeStatus(message) {
    // Extract port, timestamp, and status from the message
    const portRegex = /Port (\d+) on .* is (open|closed)/;
    const portMatch = message.match(portRegex);
    const port = portMatch ? parseInt(portMatch[1]) : '';
    const timestampRegex = /\[(.*?)\]/;
    const timestampMatch = message.match(timestampRegex);
    const timestamp = timestampMatch ? new Date(timestampMatch[1]).getTime() : '';
    const status = portMatch ? portMatch[2] : '';

    return [port, timestamp, status];
}

// Send output data to the server
function sendOutputDataToServer() {
    // Perform an AJAX request to send outputData to the server
    // Here, you can use XMLHttpRequest or any other library like Axios

    // For example, using XMLHttpRequest:
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/saveOutputData', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                console.log('Output data saved successfully');
            } else {
                console.error('Failed to save output data');
            }
        }
    };
    xhr.send(JSON.stringify({ outputData: outputData }));
}

// Add a function to periodically send output data to the server
function sendOutputDataPeriodically() {
    // Set an interval to periodically send output data to the server
    refreshInterval = setInterval(function() {
        sendOutputDataToServer();
    }, 60000); // Send data every minute (adjust as needed)
}

// Call the function to send output data periodically
sendOutputDataPeriodically();
