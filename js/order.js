// Daily Tiffin & Co. - Order & Payment JavaScript

// Order data - will be populated from localStorage or API
let orderData = {
    items: [],
    subtotal: 0,
    tax: 0,
    delivery: 20,
    total: 0
};

// DOM Elements
const orderDetailsElement = document.getElementById('order-details');
const subtotalElement = document.getElementById('subtotal-price');
const taxElement = document.getElementById('tax-price');
const deliveryElement = document.getElementById('delivery-price');
const totalElement = document.getElementById('total-price');
const popupTotalElement = document.getElementById('popup-total-price');
const payButton = document.getElementById('pay-button');
const paymentOverlay = document.getElementById('payment-overlay');
const closePaymentButton = document.getElementById('close-payment');
const paymentOptions = document.querySelectorAll('.payment-option');
const razorpayContainer = document.getElementById('razorpay-container');
const form = document.getElementById('delivery-form');

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    // Load order data (from localStorage or API)
    loadOrderData();
    
    // Setup event listeners
    setupEventListeners();
    
    // Populate order summary
    renderOrderSummary();
    
    // Prefill delivery form if user is logged in
    prefillDeliveryForm();
});

// Load order data from localStorage or API
function loadOrderData() {
    try {
        // Try to get order data from localStorage (temporary storage)
        const storedOrder = localStorage.getItem('dailyTiffin_orderData');
        if (storedOrder) {
            orderData = JSON.parse(storedOrder);
        } else {
            // For demo purposes, we'll use sample data if none exists
            loadSampleOrder();
        }
        
        // Calculate totals
        calculateTotals();
    } catch (error) {
        console.error('Error loading order data:', error);
        // Load sample data as fallback
        loadSampleOrder();
    }
}

// Load sample order data for demonstration
function loadSampleOrder() {
    orderData = {
        items: [
            {
                id: 'meal1',
                name: 'Premium Veg Breakfast',
                description: 'Fresh puri with aloo sabji, fruit salad, and mint chutney.',
                price: 120,
                quantity: 2,
                image: 'puri sabji.jpg',
                frequency: 'one-time'
            },
            {
                id: 'meal2',
                name: 'Light Breakfast Combo',
                description: 'Idli, sambar, and coconut chutney with a side of fresh fruits.',
                price: 100,
                quantity: 1,
                image: 'veg thali simple.jpg',
                frequency: 'one-time'
            }
        ],
        subtotal: 0, // Will be calculated
        tax: 0,      // Will be calculated
        delivery: 20,
        total: 0     // Will be calculated
    };
    
    calculateTotals();
}

// Calculate order totals
function calculateTotals() {
    // Calculate subtotal
    orderData.subtotal = orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Calculate tax (5%)
    orderData.tax = Math.round(orderData.subtotal * 0.05);
    
    // Calculate total
    orderData.total = orderData.subtotal + orderData.tax + orderData.delivery;
    
    // Update UI
    updateTotalsUI();
}

// Update totals in the UI
function updateTotalsUI() {
    subtotalElement.textContent = `₹${orderData.subtotal.toFixed(2)}`;
    taxElement.textContent = `₹${orderData.tax.toFixed(2)}`;
    deliveryElement.textContent = `₹${orderData.delivery.toFixed(2)}`;
    totalElement.textContent = `₹${orderData.total.toFixed(2)}`;
    popupTotalElement.textContent = `₹${orderData.total.toFixed(2)}`;
}

// Render order summary in the UI
function renderOrderSummary() {
    // Clear loading spinner
    orderDetailsElement.innerHTML = '';
    
    // If no items, show a message
    if (orderData.items.length === 0) {
        orderDetailsElement.innerHTML = '<p>No items in your order. Please add items to continue.</p>';
        return;
    }
    
    // Render each order item
    orderData.items.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'order-item';
        itemElement.innerHTML = `
            <div class="order-item-image">
                <img src="assets/${item.image}" alt="${item.name}">
            </div>
            <div class="order-item-details">
                <div class="order-item-title">${item.name}</div>
                <div class="order-item-description">${item.description}</div>
                <div class="order-item-price">₹${item.price.toFixed(2)} × ${item.quantity}</div>
            </div>
            <div class="order-item-quantity">
                <button class="quantity-btn decrease" data-id="${item.id}">-</button>
                <span class="quantity-value">${item.quantity}</span>
                <button class="quantity-btn increase" data-id="${item.id}">+</button>
            </div>
        `;
        orderDetailsElement.appendChild(itemElement);
    });
    
    // Add event listeners for quantity buttons
    document.querySelectorAll('.quantity-btn').forEach(button => {
        button.addEventListener('click', handleQuantityChange);
    });
}

// Handle quantity change
function handleQuantityChange(event) {
    const button = event.target;
    const itemId = button.getAttribute('data-id');
    const isIncrease = button.classList.contains('increase');
    
    // Find the item in orderData
    const itemIndex = orderData.items.findIndex(item => item.id === itemId);
    if (itemIndex === -1) return;
    
    // Update quantity
    if (isIncrease) {
        orderData.items[itemIndex].quantity += 1;
    } else {
        // Decrease quantity, but don't go below 1
        if (orderData.items[itemIndex].quantity > 1) {
            orderData.items[itemIndex].quantity -= 1;
        } else {
            // If quantity would be 0, ask if they want to remove
            if (confirm('Remove this item from your order?')) {
                orderData.items.splice(itemIndex, 1);
            }
        }
    }
    
    // Save updated order data
    saveOrderData();
    
    // Re-render order summary and update totals
    renderOrderSummary();
    calculateTotals();
}

// Save order data to localStorage
function saveOrderData() {
    localStorage.setItem('dailyTiffin_orderData', JSON.stringify(orderData));
}

// Setup event listeners
function setupEventListeners() {
    // Payment button click
    payButton.addEventListener('click', openPaymentOverlay);
    
    // Close payment overlay
    closePaymentButton.addEventListener('click', closePaymentOverlay);
    
    // Payment option selection
    paymentOptions.forEach(option => {
        option.addEventListener('click', selectPaymentOption);
    });
    
    // Form submission
    form.addEventListener('submit', handleFormSubmit);
}

// Open payment overlay
function openPaymentOverlay() {
    // Validate form first
    if (!validateForm()) {
        return;
    }
    
    // Show the payment overlay
    paymentOverlay.classList.add('active');
    
    // Initialize Razorpay
    initializeRazorpay();
}

// Close payment overlay
function closePaymentOverlay() {
    paymentOverlay.classList.remove('active');
}

// Select payment option
function selectPaymentOption(event) {
    // Remove active class from all options
    paymentOptions.forEach(option => option.classList.remove('active'));
    
    // Add active class to clicked option
    event.currentTarget.classList.add('active');
    
    // Get the selected payment method
    const method = event.currentTarget.getAttribute('data-method');
    
    // Update Razorpay options if needed
    updateRazorpayMethod(method);
}

// Validate the delivery form
function validateForm() {
    // Simple validation - check if required fields are filled
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            isValid = false;
            field.classList.add('error');
        } else {
            field.classList.remove('error');
        }
    });
    
    if (!isValid) {
        alert('Please fill in all required fields to proceed.');
    }
    
    return isValid;
}

// Prefill delivery form if user is logged in
function prefillDeliveryForm() {
    try {
        const token = localStorage.getItem('authToken');
        if (token) {
            // Get user data from API or localStorage
            const userData = JSON.parse(localStorage.getItem('userData'));
            if (userData) {
                // Prefill form fields
                document.getElementById('firstName').value = userData.name.split(' ')[0] || '';
                document.getElementById('lastName').value = userData.name.split(' ')[1] || '';
                document.getElementById('email').value = userData.email || '';
                document.getElementById('phone').value = userData.phone || '';
                document.getElementById('address').value = userData.address || '';
            }
        }
    } catch (error) {
        console.error('Error prefilling form:', error);
    }
}

// Initialize Razorpay
function initializeRazorpay() {
    // Get order details from form
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    
    // Create Razorpay options
    const options = {
        key: 'rzp_test_1DP5mmOlF5G5ag', // Replace with your actual Razorpay test key
        amount: orderData.total * 100, // Amount in paise
        currency: 'INR',
        name: 'Daily Tiffin & Co.',
        description: `Order Payment (${orderData.items.length} items)`,
        image: 'assets/Daily_Tiffin_226x223.png',
        handler: handlePaymentSuccess,
        prefill: {
            name: `${firstName} ${lastName}`,
            email: email,
            contact: phone
        },
        theme: {
            color: '#01FF01'
        },
        modal: {
            ondismiss: function() {
                closePaymentOverlay();
            }
        }
    };
    
    // Create Razorpay instance
    const rzp = new Razorpay(options);
    
    // Create and add the payment button
    razorpayContainer.innerHTML = '';
    const payBtn = document.createElement('button');
    payBtn.className = 'razorpay-payment-button';
    payBtn.textContent = 'Pay Now with Razorpay';
    payBtn.addEventListener('click', () => rzp.open());
    razorpayContainer.appendChild(payBtn);
}

// Update Razorpay payment method
function updateRazorpayMethod(method) {
    // In a real implementation, this would update the Razorpay options
    // For now, we'll just show a different button text
    const payBtn = razorpayContainer.querySelector('.razorpay-payment-button');
    if (payBtn) {
        switch (method) {
            case 'card':
                payBtn.textContent = 'Pay Now with Card';
                break;
            case 'upi':
                payBtn.textContent = 'Pay Now with UPI';
                break;
            case 'wallet':
                payBtn.textContent = 'Pay Now with Wallet';
                break;
            default:
                payBtn.textContent = 'Pay Now with Razorpay';
        }
    }
}

// Handle payment success
function handlePaymentSuccess(response) {
    // In a real implementation, you would verify the payment with your server
    // For now, we'll just show a success message
    
    // Close payment overlay first
    closePaymentOverlay();
    
    // Show success message
    showPaymentSuccess(response);
    
    // Clear the order data from localStorage
    localStorage.removeItem('dailyTiffin_orderData');
    
    // Save order to user's order history
    saveOrderToHistory();
}

// Handle form submission
function handleFormSubmit(event) {
    event.preventDefault();
    openPaymentOverlay();
}

// Show payment success message
function showPaymentSuccess(response) {
    // Create success overlay
    const successOverlay = document.createElement('div');
    successOverlay.className = 'payment-overlay active';
    
    successOverlay.innerHTML = `
        <div class="payment-popup">
            <div class="payment-success">
                <div class="success-icon">
                    <i class="fas fa-check"></i>
                </div>
                <h3>Payment Successful!</h3>
                <p>Your order has been placed successfully. You will receive a confirmation email shortly.</p>
                <a href="index.html" class="view-order-btn">Return to Home</a>
            </div>
        </div>
    `;
    
    // Add to body
    document.body.appendChild(successOverlay);
    
    // Close after some time
    setTimeout(() => {
        document.body.removeChild(successOverlay);
        window.location.href = 'index.html';
    }, 5000);
}

// Save order to user's order history
function saveOrderToHistory() {
    try {
        // In a real implementation, this would save the order to the server
        // For now, just store it in localStorage
        const orderHistory = JSON.parse(localStorage.getItem('orderHistory') || '[]');
        
        // Add current order to history
        const order = {
            id: 'ORD' + Date.now(),
            items: orderData.items,
            total: orderData.total,
            date: new Date().toISOString(),
            status: 'processing'
        };
        
        orderHistory.push(order);
        localStorage.setItem('orderHistory', JSON.stringify(orderHistory));
        
    } catch (error) {
        console.error('Error saving order history:', error);
    }
}
