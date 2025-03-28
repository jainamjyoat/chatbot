document.addEventListener('DOMContentLoaded', () => {
    const chatForm = document.getElementById('chatForm');
    const messageInput = document.getElementById('messageInput');
    const chatMessages = document.getElementById('chatMessages');
    const typingIndicator = document.getElementById('typingIndicator');

    // Get current health metrics from the dashboard
    function getCurrentMetrics() {
        return {
            heart_rate: parseFloat(document.getElementById('currentHeartRate').textContent.split(' ')[0]),
            steps: parseFloat(document.getElementById('currentSteps').textContent.replace(',', '')),
            calories: parseFloat(document.getElementById('currentCalories').textContent.replace(',', ''))
        };
    }

    // Generate personalized recommendations based on metrics
    function getPersonalizedRecommendations() {
        const metrics = getCurrentMetrics();
        const recommendations = [];

        // Heart rate recommendations
        const heartRate = parseInt(metrics.heart_rate);
        if (heartRate > 85) {
            recommendations.push("Your heart rate is slightly elevated. Consider taking a 5-minute breathing break.");
        } else if (heartRate < 60) {
            recommendations.push("Your heart rate is on the lower side. Some light cardio could help boost your circulation.");
        }

        // Steps recommendations
        const steps = parseInt(metrics.steps);
        const stepsGoal = 10000;
        const remainingSteps = stepsGoal - steps;
        if (remainingSteps > 0) {
            recommendations.push(`You need ${remainingSteps.toLocaleString()} more steps to reach your daily goal. A ${Math.round(remainingSteps/1000 * 10)} minute walk could help you get there!`);
        } else {
            recommendations.push("Great job! You've reached your daily steps goal. Keep up the active lifestyle!");
        }

        // Calories recommendations
        const calories = parseInt(metrics.calories);
        if (calories < 2000) {
            recommendations.push("Your calorie burn is below target. Consider incorporating some strength training or HIIT exercises.");
        } else if (calories > 2500) {
            recommendations.push("You're burning calories at a good rate! Remember to stay hydrated and maintain a balanced diet.");
        }

        // Time-based recommendations
        const hour = new Date().getHours();
        if (hour >= 7 && hour <= 9) {
            recommendations.push("Morning is a great time for yoga or stretching to energize your day!");
        } else if (hour >= 12 && hour <= 14) {
            recommendations.push("Consider taking a post-lunch walk to aid digestion and avoid afternoon fatigue.");
        } else if (hour >= 17 && hour <= 19) {
            recommendations.push("Evening is approaching - perfect time for a workout if you haven't exercised yet today.");
        } else if (hour >= 21) {
            recommendations.push("It's getting late - focus on gentle stretching and prepare for quality sleep.");
        }

        return recommendations;
    }

    // Sample responses for demo purposes
    const responses = {
        'heart rate': () => `Your heart rate is currently ${getCurrentMetrics().heart_rate.toFixed(2)} BPM. ${
            parseInt(getCurrentMetrics().heart_rate) > 85 
                ? "This is slightly elevated. Try some deep breathing exercises." 
                : "This is within a healthy range. Keep up the good work!"
        }`,
        'steps': () => {
            const steps = parseInt(getCurrentMetrics().steps);
            const percentage = Math.round((steps / 10000) * 100);
            return `You've taken ${steps.toLocaleString()} steps today! You're ${percentage}% of the way to your daily goal of 10,000 steps. ${
                steps < 10000 
                    ? `Just ${(10000 - steps).toLocaleString()} more steps to go!` 
                    : "Amazing job exceeding your goal!"
            }`;
        },
        'calories': () => {
            const calories = parseInt(getCurrentMetrics().calories);
            return `You've burned ${calories.toLocaleString()} calories today. ${
                calories > 2000 
                    ? "You're maintaining a great activity level!" 
                    : "Consider adding some more movement to your day."
            }`;
        },
        'recommendations': () => {
            const recommendations = getPersonalizedRecommendations();
            return "Based on your current health metrics:\n" + recommendations.join("\n");
        },
        'help': 'I can help you with:\n• Tracking your heart rate\n• Monitoring your step count\n• Analyzing your calorie burn\n• Providing personalized health recommendations\n• Setting and tracking fitness goals'
    };

    // Add message to chat
    function addMessage(message, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message glass-card p-3 rounded-lg max-w-[80%] ${isUser ? 'ml-auto' : ''}`;
        
        let messageContent = '';
        
        if (!isUser) {
            messageContent += `
                <div class="flex items-center mb-2">
                    <div class="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center mr-2">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                        </svg>
                    </div>
                    <span class="text-sm text-gray-300">AI Assistant</span>
                </div>`;
        } else {
            messageContent += `
                <div class="flex items-center mb-2 justify-end">
                    <span class="text-sm text-gray-300">You</span>
                    <div class="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center ml-2">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                        </svg>
                    </div>
                </div>`;
        }

        messageContent += `<p class="text-white whitespace-pre-wrap">${message}</p>`;
        messageDiv.innerHTML = messageContent;
        
        // Add fade-in animation
        messageDiv.style.opacity = '0';
        messageDiv.style.transform = 'translateY(20px)';
        chatMessages.appendChild(messageDiv);
        
        // Trigger animation
        setTimeout(() => {
            messageDiv.style.transition = 'all 0.3s ease-out';
            messageDiv.style.opacity = '1';
            messageDiv.style.transform = 'translateY(0)';
        }, 50);

        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Get AI response from the backend
    async function getAIResponse(message) {
        try {
            typingIndicator.classList.remove('hidden');
            
            const response = await fetch('http://localhost:5000/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    health_metrics: getCurrentMetrics()
                })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            return data.response;
        } catch (error) {
            console.error('Error:', error);
            return 'Sorry, I encountered an error connecting to the server. Please try again later.';
        } finally {
            typingIndicator.classList.add('hidden');
        }
    }

    // Handle form submission
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const message = messageInput.value.trim();
        if (!message) return;

        // Disable input while processing
        messageInput.disabled = true;
        
        // Add user message
        addMessage(message, true);
        messageInput.value = '';

        // Get and add AI response
        const response = await getAIResponse(message);
        addMessage(response);
        
        // Re-enable input
        messageInput.disabled = false;
        messageInput.focus();
    });

    // Handle enter key
    messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            chatForm.dispatchEvent(new Event('submit'));
        }
    });

    // Add initial welcome message
    addMessage("Hello! I'm your AI health assistant. I can help you track your:\n• Heart rate\n• Step count\n• Calories burned\n\nJust ask me about any of these, or type 'help' for more options!");
}); 