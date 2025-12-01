/**
 * ShoreSquad Application
 * Main JavaScript for interactive features and performance optimization
 */

// ========================================
// APP INITIALIZATION & STATE MANAGEMENT
// ========================================

const app = {
    // Application state
    state: {
        crews: [],
        events: [],
        userLocation: null,
        theme: localStorage.getItem('theme') || 'light',
    },

    // Initialize the application
    init() {
        console.log('🌊 ShoreSquad initializing...');
        this.setupEventListeners();
        this.loadInitialData();
        this.setupIntersectionObserver();
        this.setupPerformanceOptimizations();
    },

    // ========================================
    // EVENT LISTENERS
    // ========================================

    setupEventListeners() {
        // Mobile navigation toggle
        const navToggle = document.querySelector('.nav-toggle');
        const navMenu = document.querySelector('.nav-menu');
        if (navToggle) {
            navToggle.addEventListener('click', () => {
                const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
                navToggle.setAttribute('aria-expanded', !isExpanded);
                navMenu.classList.toggle('active');
            });
        }

        // Signup form submission
        const signupForm = document.getElementById('signupForm');
        if (signupForm) {
            signupForm.addEventListener('submit', (e) => this.handleSignup(e));
        }

        // Navigation link click handler
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                if (navMenu) navMenu.classList.remove('active');
                if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
            });
        });
    },

    // ========================================
    // DATA LOADING & MANAGEMENT
    // ========================================

    loadInitialData() {
        // Simulate loading mock data
        this.loadEvents();
        this.loadCrews();
        this.requestUserLocation();
        this.startCounterAnimation();
        this.loadDefaultWeather();
    },

    loadDefaultWeather() {
        // Load default weather forecast for Pasir Ris on page load
        const weatherData = this.getMockWeatherForecast();
        this.displayWeatherForecast(weatherData, 'Pasir Ris');
    },

    loadEvents() {
        // Mock event data
        const mockEvents = [
            {
                id: 1,
                name: 'Bondi Beach Spring Cleanup',
                date: '2025-01-15',
                location: '📍 Bondi Beach, Sydney',
                participants: 24,
                description: 'Join us for a morning beach cleanup at Bondi. Bring friends and make waves!',
            },
            {
                id: 2,
                name: 'Manly Beach Community Drive',
                date: '2025-01-20',
                location: '📍 Manly Beach, Sydney',
                participants: 18,
                description: 'Help us restore Manly Beach to its natural beauty.',
            },
            {
                id: 3,
                name: 'Collaroy Beach Eco Day',
                date: '2025-01-22',
                location: '📍 Collaroy, Sydney',
                participants: 32,
                description: 'Large-scale beach restoration with workshops and activities.',
            },
        ];

        this.state.events = mockEvents;
        this.renderEvents();
    },

    loadCrews() {
        // Mock crew data
        const mockCrews = [
            {
                id: 1,
                name: 'Beach Warriors',
                icon: '🏄',
                members: 12,
                cleanups: 8,
                location: 'Bondi, Sydney',
            },
            {
                id: 2,
                name: 'Ocean Guardians',
                icon: '🌊',
                members: 19,
                cleanups: 15,
                location: 'Manly, Sydney',
            },
            {
                id: 3,
                name: 'Coastal Crew',
                icon: '🐚',
                members: 7,
                cleanups: 5,
                location: 'Collaroy, Sydney',
            },
        ];

        this.state.crews = mockCrews;
        this.renderCrews();
    },

    renderEvents() {
        const container = document.getElementById('eventsContainer');
        if (!container) return;

        container.innerHTML = this.state.events.map(event => `
            <div class="event-card">
                <div class="event-date">${this.formatDate(event.date)}</div>
                <h3>${event.name}</h3>
                <div class="event-meta">
                    <span>${event.location}</span>
                </div>
                <div class="event-meta">
                    <span>👥 ${event.participants} joining</span>
                </div>
                <p>${event.description}</p>
                <button class="btn btn-primary" onclick="app.joinEvent(${event.id})">Join Event</button>
            </div>
        `).join('');
    },

    renderCrews() {
        const container = document.getElementById('crewsContainer');
        if (!container) return;

        container.innerHTML = this.state.crews.map(crew => `
            <div class="crew-card">
                <div class="crew-header">
                    <div class="crew-icon">${crew.icon}</div>
                    <h3 class="crew-name">${crew.name}</h3>
                </div>
                <div class="crew-body">
                    <div class="crew-info">
                        <span>👥 ${crew.members} members</span>
                    </div>
                    <div class="crew-info">
                        <span>🗑️ ${crew.cleanups} cleanups</span>
                    </div>
                    <div class="crew-info">
                        <span>📍 ${crew.location}</span>
                    </div>
                    <div class="crew-actions">
                        <button class="btn btn-primary btn-sm" onclick="app.joinCrew(${crew.id})">Join</button>
                        <button class="btn btn-secondary btn-sm" onclick="app.viewCrew(${crew.id})">View</button>
                    </div>
                </div>
            </div>
        `).join('');
    },

    // ========================================
    // WEATHER FEATURE - NEA API Integration
    // ========================================

    async getWeather() {
        const locationInput = document.getElementById('locationInput');
        const location = locationInput?.value.trim();

        if (!location) {
            alert('Please enter a beach location');
            return;
        }

        try {
            this.showWeatherLoading();
            const weatherData = await this.fetchNEAWeather();
            this.displayWeatherForecast(weatherData, location);
            this.saveSearchHistory(location);
        } catch (error) {
            console.error('Weather fetch error:', error);
            this.displayWeatherError('Unable to fetch weather data. Please try again.');
        }
    },

    async fetchNEAWeather() {
        // NEA Realtime Weather Readings API endpoint from data.gov.sg
        const apiUrl = 'https://api.data.gov.sg/v1/environment/4-day-weather-forecast';
        
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error(`API Error: ${response.status}`);
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('NEA API fetch failed:', error);
            // Fallback to mock data if API fails
            return this.getMockWeatherForecast();
        }
    },

    getMockWeatherForecast() {
        // Mock 7-day weather forecast for development/fallback
        const today = new Date();
        const forecast = [];
        
        const conditions = [
            { text: 'Sunny', icon: '☀️', tempHigh: 28, tempLow: 24 },
            { text: 'Partly Cloudy', icon: '⛅', tempHigh: 27, tempLow: 23 },
            { text: 'Thundery Showers', icon: '⛈️', tempHigh: 26, tempLow: 22 },
            { text: 'Cloudy', icon: '☁️', tempHigh: 25, tempLow: 21 },
            { text: 'Sunny', icon: '☀️', tempHigh: 28, tempLow: 24 },
            { text: 'Partly Cloudy', icon: '⛅', tempHigh: 27, tempLow: 23 },
            { text: 'Thundery Showers', icon: '⛈️', tempHigh: 26, tempLow: 22 },
        ];
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() + i);
            const condition = conditions[i];
            
            forecast.push({
                date: date.toISOString().split('T')[0],
                dayOfWeek: date.toLocaleDateString('en-SG', { weekday: 'short' }),
                dateFormatted: date.toLocaleDateString('en-SG', { month: 'short', day: 'numeric' }),
                forecast: condition.text,
                icon: condition.icon,
                tempHigh: condition.tempHigh,
                tempLow: condition.tempLow,
                humidity: 70 + Math.floor(Math.random() * 20),
                windSpeed: 10 + Math.floor(Math.random() * 12),
            });
        }
        
        return { items: [{ forecasts: forecast }] };
    },

    displayWeatherForecast(data, location) {
        const container = document.getElementById('weatherDisplay');
        if (!container) return;

        let forecastHtml = '';
        
        try {
            // Extract forecast array from NEA API response
            const forecasts = data.items?.[0]?.forecasts || [];
            
            if (forecasts.length === 0) {
                this.displayWeatherError('No forecast data available');
                return;
            }

            forecastHtml = `
                <div class="weather-forecast-header">
                    <h3>7-Day Weather Forecast for ${location}</h3>
                    <p class="forecast-subtitle">Singapore - National Environment Agency (NEA)</p>
                </div>
                <div class="forecast-grid">
            `;

            forecasts.forEach((day, index) => {
                const dateStr = day.date || new Date(new Date().getTime() + index * 86400000).toISOString().split('T')[0];
                const dateObj = new Date(dateStr);
                const dayOfWeek = dateObj.toLocaleDateString('en-SG', { weekday: 'short' });
                const dateFormatted = dateObj.toLocaleDateString('en-SG', { month: 'short', day: 'numeric' });
                
                // Determine weather icon based on forecast text
                const icon = this.getWeatherIcon(day.forecast);
                
                // Extract temperature if available (mock data includes this)
                const tempHigh = day.tempHigh || 27;
                const tempLow = day.tempLow || 22;
                
                forecastHtml += `
                    <div class="forecast-card">
                        <div class="forecast-date">
                            <div class="day-name">${dayOfWeek}</div>
                            <div class="day-date">${dateFormatted}</div>
                        </div>
                        <div class="forecast-weather">
                            <div class="weather-icon-large">${icon}</div>
                            <div class="forecast-condition">${day.forecast}</div>
                        </div>
                        <div class="forecast-temps">
                            <div class="temp-high">
                                <span class="label">High:</span>
                                <span class="value">${tempHigh}°C</span>
                            </div>
                            <div class="temp-low">
                                <span class="label">Low:</span>
                                <span class="value">${tempLow}°C</span>
                            </div>
                        </div>
                        <div class="forecast-details">
                            <div class="detail-item">
                                <span class="detail-icon">💧</span>
                                <span class="detail-value">${day.humidity || 70}%</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-icon">💨</span>
                                <span class="detail-value">${day.windSpeed || 12} km/h</span>
                            </div>
                        </div>
                    </div>
                `;
            });

            forecastHtml += '</div>';
            container.innerHTML = forecastHtml;
        } catch (error) {
            console.error('Error displaying forecast:', error);
            this.displayWeatherError('Error processing weather data');
        }
    },

    getWeatherIcon(condition) {
        // Map weather condition text to appropriate emoji icons
        const conditionLower = condition.toLowerCase();
        
        const iconMap = {
            'sunny': '☀️',
            'clear': '☀️',
            'partly': '⛅',
            'mostly': '⛅',
            'cloudy': '☁️',
            'overcast': '☁️',
            'rain': '🌧️',
            'showers': '🌧️',
            'thundery': '⛈️',
            'thunder': '⛈️',
            'windy': '💨',
            'haze': '🌫️',
            'mist': '🌫️',
        };
        
        for (const [key, icon] of Object.entries(iconMap)) {
            if (conditionLower.includes(key)) {
                return icon;
            }
        }
        
        return '⛅'; // Default fallback
    },

    showWeatherLoading() {
        const container = document.getElementById('weatherDisplay');
        if (container) {
            container.innerHTML = '<div class="weather-loading">Loading forecast...</div>';
        }
    },

    displayWeatherError(message) {
        const container = document.getElementById('weatherDisplay');
        if (container) {
            container.innerHTML = `<div class="weather-error">⚠️ ${message}</div>`;
        }
    },

    // ========================================
    // USER INTERACTIONS
    // ========================================

    joinEvent(eventId) {
        const event = this.state.events.find(e => e.id === eventId);
        if (event) {
            event.participants++;
            this.renderEvents();
            this.showNotification(`✅ You joined "${event.name}"!`);
            this.saveUserAction('join_event', eventId);
        }
    },

    joinCrew(crewId) {
        const crew = this.state.crews.find(c => c.id === crewId);
        if (crew) {
            crew.members++;
            this.renderCrews();
            this.showNotification(`✅ Joined "${crew.name}"!`);
            this.saveUserAction('join_crew', crewId);
        }
    },

    viewCrew(crewId) {
        const crew = this.state.crews.find(c => c.id === crewId);
        if (crew) {
            alert(`${crew.icon} ${crew.name}\n\nMembers: ${crew.members}\nCleanups: ${crew.cleanups}\nLocation: ${crew.location}`);
        }
    },

    handleSignup(event) {
        event.preventDefault();
        const name = document.getElementById('nameInput').value;
        const email = document.getElementById('emailInput').value;
        const beach = document.getElementById('beachInput').value;

        if (name && email) {
            this.saveUserSignup({ name, email, beach });
            this.showNotification('🎉 Welcome to ShoreSquad! Check your email for next steps.');
            event.target.reset();
        }
    },

    // ========================================
    // GEOLOCATION
    // ========================================

    requestUserLocation() {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.state.userLocation = {
                        lat: position.coords.latitude,
                        lon: position.coords.longitude,
                    };
                    console.log('📍 User location detected:', this.state.userLocation);
                },
                (error) => {
                    console.log('Location permission denied or unavailable');
                }
            );
        }
    },

    // ========================================
    // PERFORMANCE OPTIMIZATIONS
    // ========================================

    setupIntersectionObserver() {
        // Lazy load images and sections
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    }
                });
            }, { threshold: 0.1 });

            document.querySelectorAll('.feature-card, .event-card, .crew-card').forEach(el => {
                observer.observe(el);
            });
        }
    },

    setupPerformanceOptimizations() {
        // Prefetch DNS for external APIs
        this.addDnsPreFetch('https://api.openweathermap.org');

        // Throttle resize events
        window.addEventListener('resize', this.throttle(() => {
            console.log('Window resized');
        }, 250));

        // Enable passive event listeners for scroll performance
        window.addEventListener('scroll', this.handleScroll.bind(this), { passive: true });
    },

    addDnsPreFetch(url) {
        const link = document.createElement('link');
        link.rel = 'dns-prefetch';
        link.href = url;
        document.head.appendChild(link);
    },

    throttle(callback, delay) {
        let lastCall = 0;
        return function (...args) {
            const now = Date.now();
            if (now - lastCall >= delay) {
                lastCall = now;
                callback(...args);
            }
        };
    },

    handleScroll() {
        // Sticky navigation effect
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar?.classList.add('scrolled');
        } else {
            navbar?.classList.remove('scrolled');
        }
    },

    // ========================================
    // ANIMATIONS & UI HELPERS
    // ========================================

    startCounterAnimation() {
        setTimeout(() => {
            document.querySelectorAll('[data-target]').forEach(el => {
                const target = parseInt(el.getAttribute('data-target'));
                this.animateCounter(el, target);
            });
        }, 500);
    },

    animateCounter(element, target) {
        let current = 0;
        const increment = target / 50;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.textContent = target.toLocaleString();
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current).toLocaleString();
            }
        }, 30);
    },

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background-color: #26A69A;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
        `;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    },

    scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
        }
    },

    // ========================================
    // LOCAL STORAGE & PERSISTENCE
    // ========================================

    saveUserSignup(userData) {
        const signups = JSON.parse(localStorage.getItem('shoresquad_signups') || '[]');
        signups.push({ ...userData, timestamp: new Date().toISOString() });
        localStorage.setItem('shoresquad_signups', JSON.stringify(signups));
    },

    saveUserAction(action, itemId) {
        const actions = JSON.parse(localStorage.getItem('shoresquad_actions') || '[]');
        actions.push({ action, itemId, timestamp: new Date().toISOString() });
        localStorage.setItem('shoresquad_actions', JSON.stringify(actions));
    },

    saveSearchHistory(location) {
        const history = JSON.parse(localStorage.getItem('shoresquad_search_history') || '[]');
        if (!history.includes(location)) {
            history.unshift(location);
            if (history.length > 5) history.pop();
            localStorage.setItem('shoresquad_search_history', JSON.stringify(history));
        }
    },

    // ========================================
    // UTILITY FUNCTIONS
    // ========================================

    formatDate(dateString) {
        const options = { month: 'short', day: 'numeric', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-AU', options);
    },
};

// ========================================
// KEYFRAME ANIMATIONS
// ========================================

const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }

    .navbar.scrolled {
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
`;
document.head.appendChild(style);

// ========================================
// INITIALIZATION
// ========================================

// Initialize app when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => app.init());
} else {
    app.init();
}


// ========================================
// CHAT WIDGET FUNCTIONALITY
// ========================================

function initializeChatWidget() {
    const chatButton = document.getElementById('chatButton');
    const chatWidget = document.getElementById('chatWidget');
    const chatToggle = document.getElementById('chatToggle');
    const chatInput = document.getElementById('chatInput');
    const chatSend = document.getElementById('chatSend');
    const chatMessages = document.getElementById('chatMessages');

    if (!chatButton) return;

    // Toggle chat widget
    chatButton.addEventListener('click', () => {
        chatWidget.classList.toggle('active');
        if (chatWidget.classList.contains('active')) {
            chatInput.focus();
        }
    });

    // Close chat widget
    chatToggle.addEventListener('click', () => {
        chatWidget.classList.remove('active');
    });

    // Send message on button click
    chatSend.addEventListener('click', sendMessage);

    // Send message on Enter key
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    function sendMessage() {
        const message = chatInput.value.trim();
        if (!message) return;

        // Add user message
        addMessage(message, 'user-message');
        chatInput.value = '';

        // Simulate bot response
        setTimeout(() => {
            const responses = [
                '🏖️ Great question! You can find upcoming cleanups in the "Cleanup Events" section.',
                '💙 Thanks for your interest! You can join a crew by scrolling down to "Join a Crew Near You".',
                '📍 Use our weather forecast to check conditions before heading out to the beach!',
                '👥 You can create a new crew or join an existing one. It\'s easy!',
                '🌊 That\'s awesome! Every piece of trash collected counts toward our impact goal.',
                '💬 Feel free to ask me anything about ShoreSquad!',
                '✨ We\'re so glad you\'re here! Let\'s make a difference together.',
                '🎯 Have you checked out our upcoming cleanup events yet?',
            ];
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];
            addMessage(randomResponse, 'bot-message');
        }, 500);

        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function addMessage(text, className) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${className}`;
        messageDiv.innerHTML = `<p>${text}</p>`;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

// Service Worker Registration (for offline capability)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {
            console.log('Service Worker registration not available');
        });
    });
}

// Initialize chat widget when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (app.init) {
        initializeChatWidget();
    }
});

// Console welcome message
console.log('%c🌊 Welcome to ShoreSquad!', 'font-size: 20px; color: #0099CC; font-weight: bold;');
console.log('%cMobilizing young people to clean beaches and protect our coasts.', 'font-size: 14px; color: #26A69A;');

