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
    // WEATHER FEATURE
    // ========================================

    async getWeather() {
        const locationInput = document.getElementById('locationInput');
        const location = locationInput?.value.trim();

        if (!location) {
            alert('Please enter a beach location');
            return;
        }

        try {
            // Mock weather data - replace with real API call
            const weatherData = this.getMockWeather(location);
            this.displayWeather(weatherData);
            this.saveSearchHistory(location);
        } catch (error) {
            console.error('Weather fetch error:', error);
            alert('Could not fetch weather data. Please try again.');
        }
    },

    getMockWeather(location) {
        // Mock weather responses
        const weatherByLocation = {
            bondi: {
                location: 'Bondi Beach',
                temp: 24,
                condition: 'Sunny',
                icon: '☀️',
                humidity: 65,
                windSpeed: 12,
                uvIndex: 8,
            },
            manly: {
                location: 'Manly Beach',
                temp: 23,
                condition: 'Partly Cloudy',
                icon: '⛅',
                humidity: 72,
                windSpeed: 15,
                uvIndex: 7,
            },
            collaroy: {
                location: 'Collaroy Beach',
                temp: 22,
                condition: 'Cloudy',
                icon: '☁️',
                humidity: 78,
                windSpeed: 18,
                uvIndex: 5,
            },
            default: {
                location: location,
                temp: 23,
                condition: 'Partly Cloudy',
                icon: '⛅',
                humidity: 70,
                windSpeed: 14,
                uvIndex: 6,
            },
        };

        return weatherByLocation[location.toLowerCase()] || weatherByLocation.default;
    },

    displayWeather(data) {
        const container = document.getElementById('weatherDisplay');
        if (!container) return;

        container.innerHTML = `
            <div class="weather-card">
                <div class="weather-icon">${data.icon}</div>
                <div class="weather-temp">${data.temp}°C</div>
                <div class="weather-description">${data.condition} at ${data.location}</div>
                <div class="weather-details">
                    <div class="weather-detail">
                        <strong>💧</strong><br>${data.humidity}% Humidity
                    </div>
                    <div class="weather-detail">
                        <strong>💨</strong><br>${data.windSpeed} km/h Wind
                    </div>
                    <div class="weather-detail">
                        <strong>☀️</strong><br>UV Index ${data.uvIndex}
                    </div>
                </div>
            </div>
        `;
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

// Service Worker Registration (for offline capability)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {
            console.log('Service Worker registration not available');
        });
    });
}

// Console welcome message
console.log('%c🌊 Welcome to ShoreSquad!', 'font-size: 20px; color: #0099CC; font-weight: bold;');
console.log('%cMobilizing young people to clean beaches and protect our coasts.', 'font-size: 14px; color: #26A69A;');
