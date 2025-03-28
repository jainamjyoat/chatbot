// Initialize Chart.js with dark theme
Chart.defaults.color = '#fff';
Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.1)';

const ctx = document.getElementById('healthChart').getContext('2d');
let healthChart;

// Initialize health data
let healthData = {
    heartRate: [72, 75, 68, 70, 73, 71, 69],
    steps: [8450, 10200, 7800, 9300, 11000, 8700, 9500],
    calories: [2150, 2300, 2050, 2200, 2400, 2180, 2250]
};

// Chart configuration
function createChart() {
    const labels = Array.from({ length: 7 }, (_, i) => `Day ${i + 1}`);
    
    healthChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Heart Rate (BPM)',
                    data: healthData.heartRate,
                    borderColor: 'rgb(244, 114, 182)',
                    backgroundColor: 'rgba(244, 114, 182, 0.2)',
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Steps (x100)',
                    data: healthData.steps.map(steps => steps / 100),
                    borderColor: 'rgb(34, 197, 94)',
                    backgroundColor: 'rgba(34, 197, 94, 0.2)',
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Calories',
                    data: healthData.calories,
                    borderColor: 'rgb(59, 130, 246)',
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    fill: true,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: '#fff',
                        font: {
                            size: 12
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#fff'
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#fff'
                    }
                }
            }
        }
    });
}

// Update health metrics
function updateHealthMetrics() {
    // Simulate new data
    const newHeartRate = Math.floor(65 + Math.random() * 15);
    const newSteps = Math.floor(7000 + Math.random() * 5000);
    const newCalories = Math.floor(2000 + Math.random() * 500);

    // Update arrays
    healthData.heartRate = [...healthData.heartRate.slice(1), newHeartRate];
    healthData.steps = [...healthData.steps.slice(1), newSteps];
    healthData.calories = [...healthData.calories.slice(1), newCalories];

    // Update chart
    healthChart.data.datasets[0].data = healthData.heartRate;
    healthChart.data.datasets[1].data = healthData.steps.map(steps => steps / 100);
    healthChart.data.datasets[2].data = healthData.calories;
    healthChart.update();

    // Update current metrics display
    document.getElementById('currentHeartRate').textContent = `${newHeartRate} BPM`;
    document.getElementById('currentSteps').textContent = newSteps.toLocaleString();
    document.getElementById('currentCalories').textContent = newCalories.toLocaleString();
}

// Chatbot functionality
const chatMessages = document.getElementById('chatMessages');
const chatForm = document.getElementById('chatForm');
const messageInput = document.getElementById('messageInput');

// AI response generator
function generateAIResponse(message) {
    const responses = {
        heartRate: "Your heart rate is within a healthy range. The average resting heart rate for adults is between 60-100 BPM.",
        steps: "You're making good progress with your steps. The recommended daily goal is 10,000 steps.",
        calories: "Your caloric burn is looking good. Remember to maintain a balanced diet alongside your activity.",
        default: "I'm here to help you track and understand your health metrics. What would you like to know?"
    };

    message = message.toLowerCase();
    if (message.includes('heart') || message.includes('bpm')) {
        return responses.heartRate;
    } else if (message.includes('step') || message.includes('walk')) {
        return responses.steps;
    } else if (message.includes('calorie') || message.includes('burn')) {
        return responses.calories;
    }
    return responses.default;
}

// Add message to chat
function addMessage(content, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${isUser ? 'ml-auto bg-blue-900' : 'bg-slate-800'} p-3 rounded-lg max-w-[80%]`;
    messageDiv.innerHTML = `<p class="text-white">${content}</p>`;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Handle chat form submission
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = messageInput.value.trim();
    if (!message) return;

    // Add user message
    addMessage(message, true);
    messageInput.value = '';

    // Simulate AI response
    setTimeout(() => {
        const response = generateAIResponse(message);
        addMessage(response);
    }, 500);
});

// Initialize the application
createChart();

// Update metrics every 5 seconds
setInterval(updateHealthMetrics, 5000); 