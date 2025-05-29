// Daily Tiffin & Co. - Main JavaScript File

// Global Variables
let selectedMeal = null;

// Modal Elements
const loginModal = document.getElementById('loginModal');
const registerModal = document.getElementById('registerModal');
const profileModal = document.getElementById('profileModal');

// Button Elements
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const profileBtn = document.getElementById('profileBtn');
const logoutBtn = document.getElementById('logoutBtn');

// Close buttons
const closeButtons = document.querySelectorAll('.close');

// Function to handle toggle selection
function handleToggleClick(event) {
    // Get the parent toggle options container
    const toggleOptions = event.target.closest('.toggle-options');
    if (!toggleOptions) return;
    
    // Remove active class from all options in this toggle group
    const options = toggleOptions.querySelectorAll('.toggle-option');
    options.forEach(option => {
        option.classList.remove('active');
    });
    
    // Add active class to the clicked option
    event.target.classList.add('active');
    
    // Update meal cards based on selected options (can be expanded later)
    updateMealCards();
}

// Function to update displayed meal cards based on selected options
function updateMealCards() {
    // Get all selected options
    const mealType = document.querySelector('.toggle-section:nth-child(1) .toggle-option.active')?.textContent.trim().toLowerCase();
    const frequency = document.querySelector('.toggle-section:nth-child(2) .toggle-option.active')?.textContent.trim().toLowerCase();
    const preference = document.querySelector('.toggle-section:nth-child(3) .toggle-option.active')?.textContent.trim().toLowerCase();
    
    console.log(`Selected options: ${mealType}, ${frequency}, ${preference}`);
    
    // Handle meal type navigation
    if (mealType && ['breakfast', 'lunch', 'dinner', 'instant'].includes(mealType)) {
        // Check if we need to navigate to a different page
        const currentPage = window.location.pathname.split('/').pop().split('.')[0];
        if (currentPage !== mealType && currentPage !== 'index') {
            window.location.href = `${mealType}.html`;
            return;
        }
    }
    
    // IMPORTANT: Only find meal cards inside the specific section
    // This ensures we don't accidentally create or move content elsewhere
    const mealSection = document.getElementById('meal-section');
    if (!mealSection) return;
    
    const mealCardsContainer = mealSection.querySelector('.meal-cards');
    if (!mealCardsContainer) return;
    
    const mealCards = mealCardsContainer.querySelectorAll('.meal-card');
    if (mealCards.length === 0) return;
    
    mealCards.forEach(card => {
        const cardType = card.dataset.type;
        const cardPreference = card.dataset.preference;
        
        // Show card if it matches the selected filters, or if no specific filter is applied
        if ((cardType === preference || !preference) && 
            (cardPreference === mealType || !mealType)) {
            card.style.display = 'block';
            
            // Update subscription price display
            updateSubscriptionPrice(card, frequency);
        } else {
            card.style.display = 'none';
        }
    });
}

// Function to update subscription price display
function updateSubscriptionPrice(card, frequency) {
    const priceElement = card.querySelector('.meal-price');
    const subscriptionPriceElement = card.querySelector('.subscription-price');
    
    if (!priceElement || !subscriptionPriceElement) return;
    
    // Get base price from the price element (remove the ₹ symbol and convert to number)
    const basePrice = parseInt(priceElement.textContent.replace('₹', '').trim());
    
    // Clear subscription price by default
    subscriptionPriceElement.textContent = '';
    subscriptionPriceElement.style.display = 'none';
    
    // Calculate subscription prices based on frequency
    if (frequency === 'weekly') {
        const weeklyPrice = basePrice * 7;
        const discount = Math.round(weeklyPrice * 0.1); // 10% discount
        const finalPrice = weeklyPrice - discount;
        
        subscriptionPriceElement.innerHTML = `
            <span class="price-option">₹${basePrice} × 7 = ₹${weeklyPrice}</span>
            <span class="price-option weekly">10% off = ₹${finalPrice}</span>
        `;
        subscriptionPriceElement.style.display = 'block';
    } else if (frequency === 'monthly') {
        const monthlyPrice = basePrice * 30;
        const discount = Math.round(monthlyPrice * 0.15); // 15% discount
        const finalPrice = monthlyPrice - discount;
        
        subscriptionPriceElement.innerHTML = `
            <span class="price-option">₹${basePrice} × 30 = ₹${monthlyPrice}</span>
            <span class="price-option monthly">15% off = ₹${finalPrice}</span>
        `;
        subscriptionPriceElement.style.display = 'block';
    }
}

// Function to initialize meal cards that are already in the HTML
function initializeMealCards() {
    // First, check the meal type and frequency selections
    const mealType = document.querySelector('.toggle-section:nth-child(1) .toggle-option.active')?.textContent.trim().toLowerCase();
    const frequency = document.querySelector('.toggle-section:nth-child(2) .toggle-option.active')?.textContent.trim().toLowerCase();
    const preference = document.querySelector('.toggle-section:nth-child(3) .toggle-option.active')?.textContent.trim().toLowerCase();
    
    // Get all meal cards on the page
    const mealSection = document.getElementById('meal-section');
    if (!mealSection) return;
    
    const mealCards = mealSection.querySelectorAll('.meal-card');
    if (mealCards.length === 0) return;
    
    // Update the subscription price for each card based on the current frequency
    mealCards.forEach(card => {
        // Show/hide based on preference
        const cardType = card.dataset.type;
        if (preference && cardType !== preference) {
            card.style.display = 'none';
        } else {
            card.style.display = 'block';
            // Update subscription price
            updateSubscriptionPrice(card, frequency);
        }
    });
}

// Function to load meals from the API
async function loadMeals(category) {
    // For now, just initialize the existing hardcoded meal cards
    initializeMealCards();
}

// Function to add a meal to cart
function addToCart(meal) {
    // Check if user is logged in
    if (!API.auth.isLoggedIn()) {
        alert('Please login to add items to cart');
        openModal(loginModal);
        return;
    }
    
    // Add to cart logic here
    alert(`Added ${meal.name} to cart!`);
    console.log('Added to cart:', meal);
    
    // Here you would typically store the cart items in localStorage
    // and update a cart counter in the UI
}

// Function to initialize event listeners
function initializeToggleButtons() {
    // Add click event listeners to all toggle options
    const toggleOptions = document.querySelectorAll('.toggle-option');
    toggleOptions.forEach(option => {
        option.addEventListener('click', handleToggleClick);
    });
}

// Add mobile menu functionality
function initializeMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('nav ul');
    
    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            navMenu.classList.toggle('show');
        });
    }
}

// Modal Functions
function openModal(modal) {
    if (modal) modal.style.display = 'block';
}

function closeModal(modal) {
    if (modal) modal.style.display = 'none';
}

function closeAllModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.style.display = 'none';
    });
}

// Auth Functions
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const messageElement = document.getElementById('loginMessage');
    
    messageElement.textContent = 'Logging in...';
    messageElement.className = 'message';
    
    try {
        const result = await API.auth.login(email, password);
        
        if (result.success) {
            messageElement.textContent = 'Login successful!';
            messageElement.className = 'message success';
            
            setTimeout(() => {
                closeModal(loginModal);
                updateAuthUI();
            }, 1000);
        } else {
            messageElement.textContent = result.error || 'Login failed. Please try again.';
            messageElement.className = 'message error';
        }
    } catch (error) {
        messageElement.textContent = 'An error occurred. Please try again.';
        messageElement.className = 'message error';
        console.error(error);
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const messageElement = document.getElementById('registerMessage');
    
    messageElement.textContent = 'Registering...';
    messageElement.className = 'message';
    
    const userData = {
        name: document.getElementById('registerName').value,
        email: document.getElementById('registerEmail').value,
        password: document.getElementById('registerPassword').value,
        phone: document.getElementById('registerPhone').value,
        address: document.getElementById('registerAddress').value,
        userType: document.getElementById('registerUserType').value
    };
    
    try {
        const result = await API.auth.register(userData);
        
        if (result.success) {
            messageElement.textContent = 'Registration successful!';
            messageElement.className = 'message success';
            
            setTimeout(() => {
                closeModal(registerModal);
                updateAuthUI();
            }, 1000);
        } else {
            messageElement.textContent = result.error || 'Registration failed. Please try again.';
            messageElement.className = 'message error';
        }
    } catch (error) {
        messageElement.textContent = 'An error occurred. Please try again.';
        messageElement.className = 'message error';
        console.error(error);
    }
}

async function handleLogout() {
    // Call the logout API function
    API.auth.logout();
    
    // Update the UI to reflect logged out state
    updateAuthUI();
    
    // Show a brief logout confirmation
    const confirmationMessage = document.createElement('div');
    confirmationMessage.className = 'notification success';
    confirmationMessage.innerHTML = '<i class="fas fa-check-circle"></i> Successfully logged out!';
    document.body.appendChild(confirmationMessage);
    
    // Remove the message after a short delay
    setTimeout(() => {
        if (confirmationMessage.parentNode) {
            document.body.removeChild(confirmationMessage);
        }
    }, 2000);
    
    // Clear any order data in localStorage
    localStorage.removeItem('dailyTiffin_orderData');
    
    // Redirect to home page after a short delay
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

async function loadProfile() {
    const result = await API.auth.getProfile();
    
    if (result.success) {
        document.getElementById('profileName').textContent = result.data.name;
        document.getElementById('profileEmail').textContent = result.data.email;
        document.getElementById('profilePhone').textContent = result.data.phone;
        document.getElementById('profileAddress').textContent = result.data.address;
        document.getElementById('profileUserType').textContent = result.data.userType;
        
        // Load user orders
        const orders = await API.orders.getUserOrders();
        const ordersContainer = document.getElementById('userOrders');
        
        if (orders.success && orders.data.length > 0) {
            ordersContainer.innerHTML = orders.data.map(order => `
                <div class="order-item">
                    <p><strong>Order ID:</strong> ${order._id}</p>
                    <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
                    <p><strong>Status:</strong> ${order.status}</p>
                    <p><strong>Total:</strong> ₹${order.totalAmount}</p>
                </div>
            `).join('');
        } else {
            ordersContainer.innerHTML = '<p>No orders found.</p>';
        }
        
        // Load user subscriptions
        const subscriptions = await API.subscriptions.getUserSubscriptions();
        const subscriptionsContainer = document.getElementById('userSubscriptions');
        
        if (subscriptions.success && subscriptions.data.length > 0) {
            subscriptionsContainer.innerHTML = subscriptions.data.map(sub => `
                <div class="subscription-item">
                    <p><strong>Plan:</strong> ${sub.planType} (${sub.mealType})</p>
                    <p><strong>Started:</strong> ${new Date(sub.startDate).toLocaleDateString()}</p>
                    <p><strong>Status:</strong> ${sub.status}</p>
                    <p><strong>Total:</strong> ₹${sub.totalAmount}</p>
                </div>
            `).join('');
        } else {
            subscriptionsContainer.innerHTML = '<p>No subscriptions found.</p>';
        }
    }
}

function updateAuthUI() {
    const isLoggedIn = API.auth.isLoggedIn();
    
    if (isLoggedIn) {
        loginBtn.classList.add('hidden');
        registerBtn.classList.add('hidden');
        profileBtn.classList.remove('hidden');
        logoutBtn.classList.remove('hidden');
    } else {
        loginBtn.classList.remove('hidden');
        registerBtn.classList.remove('hidden');
        profileBtn.classList.add('hidden');
        logoutBtn.classList.add('hidden');
    }
}

// Initialize auth functionality
function initializeAuth() {
    // Modal open buttons
    loginBtn.addEventListener('click', () => openModal(loginModal));
    registerBtn.addEventListener('click', () => openModal(registerModal));
    profileBtn.addEventListener('click', () => {
        openModal(profileModal);
        loadProfile();
    });
    logoutBtn.addEventListener('click', handleLogout);
    
    // Close buttons
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            closeAllModals();
        });
    });
    
    // Form submissions
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
    
    // Close modals when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target.classList.contains('modal')) {
            closeAllModals();
        }
    });
    
    // Update UI based on auth state
    updateAuthUI();
}

// Setup Order Now buttons - use event delegation for better reliability
function setupOrderButtons() {
    // Use event delegation on the document body
    document.body.addEventListener('click', function(event) {
        // Check if the clicked element is an Order Now button or its child
        const orderButton = event.target.closest('.btn');
        if (!orderButton) return;
        
        // Skip if this isn't an Order Now button (checking text content)
        if (orderButton.textContent.trim() !== 'Order Now') return;
        
        // We found an Order Now button
        event.preventDefault();
        console.log('Order Now button clicked');
        
        // Find the parent meal card
        const mealCard = orderButton.closest('.meal-card');
        if (!mealCard) {
            console.error('Could not find meal card');
            return;
        }

        // Get meal data from the card
        const mealName = mealCard.querySelector('.meal-title').textContent;
        const mealDescription = mealCard.querySelector('.meal-description').textContent;
        const mealPriceStr = mealCard.querySelector('.meal-price').textContent.trim();
        const mealPrice = parseInt(mealPriceStr.replace('₹', ''));
        
        // Get meal image path
        const mealImage = mealCard.querySelector('.meal-img');
        const imagePath = mealImage ? mealImage.getAttribute('src').split('/').pop() : 'default.jpg';

        // Get meal type and frequency
        const mealType = mealCard.getAttribute('data-type') || 'veg';
        const frequency = document.querySelector('.toggle-option.active[data-toggle="frequency"]') ? 
            document.querySelector('.toggle-option.active[data-toggle="frequency"]').getAttribute('data-value') : 'one-time';

        // Create meal object
        const meal = {
            id: 'meal-' + Math.random().toString(36).substr(2, 9),
            name: mealName,
            description: mealDescription,
            price: mealPrice,
            quantity: 1,
            image: imagePath,
            type: mealType,
            frequency: frequency
        };

        console.log('Saving meal to order:', meal);

        // Store the meal in localStorage
        saveMealToOrder(meal);

        // Redirect to order page
        window.location.href = 'order.html';
    });
    console.log('Order button event delegation set up');
}

// Save meal to order in localStorage
function saveMealToOrder(meal) {
    // Get existing order data or create new
    let orderData;
    try {
        const existingOrder = localStorage.getItem('dailyTiffin_orderData');
        if (existingOrder) {
            orderData = JSON.parse(existingOrder);
            
            // Check if this meal already exists in the order
            const existingMealIndex = orderData.items.findIndex(item => item.name === meal.name);
            if (existingMealIndex !== -1) {
                // Increment quantity if meal already exists
                orderData.items[existingMealIndex].quantity += 1;
            } else {
                // Add new meal
                orderData.items.push(meal);
            }
        } else {
            // Create new order
            orderData = {
                items: [meal],
                subtotal: 0,
                tax: 0,
                delivery: 20,
                total: 0
            };
        }
        
        // Save updated order
        localStorage.setItem('dailyTiffin_orderData', JSON.stringify(orderData));
    } catch (error) {
        console.error('Error saving meal to order:', error);
    }
}

// Run initialization when DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication state and update UI FIRST before any other initialization
    // This ensures consistent auth UI across all pages
    updateAuthUI();
    
    // Continue with other initializations
    initializeToggleButtons();
    initializeMobileMenu();
    initializeAuth();
    setupOrderButtons(); // Setup Order Now button functionality
    
    // If this is a meal page with toggles, highlight the correct option based on the page
    const currentPage = window.location.pathname.split('/').pop().split('.')[0];
    if (['breakfast', 'lunch', 'dinner', 'instant'].includes(currentPage)) {
        const mealTypeOptions = document.querySelectorAll('.toggle-section:nth-child(1) .toggle-option');
        mealTypeOptions.forEach(option => {
            if (option.textContent.trim().toLowerCase() === currentPage) {
                option.classList.add('active');
            } else {
                option.classList.remove('active');
            }
        });
    }
    
    // Load meals from API if this is a meal page
    if (['breakfast', 'lunch', 'dinner', 'instant'].includes(currentPage)) {
        loadMeals(currentPage);
    }
});
