// Daily Tiffin & Co. - API Integration File

// Base URL for the backend API
const API_BASE_URL = 'http://localhost:5000/api';

// Function to handle API errors
function handleApiError(error) {
    console.error('API Error:', error);
    
    // More descriptive error message
    let errorMessage;
    if (error.message === 'Failed to fetch') {
        errorMessage = 'Cannot connect to the server. Make sure the backend is running at ' + API_BASE_URL + '. If you\'re opening this file directly, try using a web server instead of the file:// protocol.';
    } else {
        errorMessage = error.message || 'Unknown error occurred';
    }
    
    // Show alert for better visibility during testing
    alert('API Error: ' + errorMessage);
    
    return { success: false, error: errorMessage };
}

// User Authentication Functions
const auth = {
    // Register a new user
    async register(userData) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Store token in localStorage
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.data));
            }
            
            return data;
        } catch (error) {
            return handleApiError(error);
        }
    },
    
    // Login an existing user
    async login(email, password) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Store token in localStorage
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.data));
            }
            
            return data;
        } catch (error) {
            return handleApiError(error);
        }
    },
    
    // Get current user profile
    async getProfile() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                return { success: false, error: 'Not authenticated' };
            }
            
            const response = await fetch(`${API_BASE_URL}/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            
            return await response.json();
        } catch (error) {
            return handleApiError(error);
        }
    },
    
    // Logout user
    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return { success: true };
    },
    
    // Check if user is logged in
    isLoggedIn() {
        return !!localStorage.getItem('token');
    }
};

// Meal Functions
const meals = {
    // Get all meals
    async getMeals(filters = {}) {
        try {
            let url = `${API_BASE_URL}/meals`;
            
            // Add query parameters for filters
            if (Object.keys(filters).length > 0) {
                const params = new URLSearchParams();
                for (const key in filters) {
                    params.append(key, filters[key]);
                }
                url += `?${params.toString()}`;
            }
            
            const response = await fetch(url);
            return await response.json();
        } catch (error) {
            return handleApiError(error);
        }
    },
    
    // Get a single meal by ID
    async getMeal(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/meals/${id}`);
            return await response.json();
        } catch (error) {
            return handleApiError(error);
        }
    }
};

// Order Functions
const orders = {
    // Create a new order
    async createOrder(orderData) {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                return { success: false, error: 'Not authenticated' };
            }
            
            const response = await fetch(`${API_BASE_URL}/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(orderData),
            });
            
            return await response.json();
        } catch (error) {
            return handleApiError(error);
        }
    },
    
    // Get user orders
    async getUserOrders() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                return { success: false, error: 'Not authenticated' };
            }
            
            const response = await fetch(`${API_BASE_URL}/orders`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            
            return await response.json();
        } catch (error) {
            return handleApiError(error);
        }
    }
};

// Subscription Functions
const subscriptions = {
    // Create a new subscription
    async createSubscription(subscriptionData) {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                return { success: false, error: 'Not authenticated' };
            }
            
            const response = await fetch(`${API_BASE_URL}/subscriptions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(subscriptionData),
            });
            
            return await response.json();
        } catch (error) {
            return handleApiError(error);
        }
    },
    
    // Get user subscriptions
    async getUserSubscriptions() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                return { success: false, error: 'Not authenticated' };
            }
            
            const response = await fetch(`${API_BASE_URL}/subscriptions`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            
            return await response.json();
        } catch (error) {
            return handleApiError(error);
        }
    }
};

// Payment Functions
const payments = {
    // Create a payment intent
    async createPaymentIntent(amount, type, orderId = null, subscriptionId = null) {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                return { success: false, error: 'Not authenticated' };
            }
            
            const response = await fetch(`${API_BASE_URL}/payments/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    amount,
                    type,
                    orderId,
                    subscriptionId
                }),
            });
            
            return await response.json();
        } catch (error) {
            return handleApiError(error);
        }
    }
};

// Export all API functions
const API = {
    auth,
    meals,
    orders,
    subscriptions,
    payments
};

// Make available globally
window.API = API;
