document.addEventListener('DOMContentLoaded', () => {
    // --- IMPORTANT: REPLACE THIS WITH THE IP ADDRESS YOU FOUND IN STEP 1 ---
    const API_URL = 'http://10.45.136.3:3000/api'; 
    
    let currentUser = null;

    // --- PAGE PROTECTION ---
    const userString = localStorage.getItem('currentUser');
    if (!userString) {
        window.location.href = 'login.html';
        return;
    } else {
        currentUser = JSON.parse(userString);
    }
    
    // --- DOM REFERENCES ---
    const donationForm = document.getElementById('donation-form');
    const conditionSelect = document.getElementById('donation-condition');
    const conditionFeedback = document.getElementById('condition-feedback');
    const pickupDateInput = document.getElementById('pickup-date');
    const submitButton = donationForm.querySelector('button[type="submit"]'); // Get the submit button
    const formMessage = document.createElement('div'); // Create a div for messages
    donationForm.appendChild(formMessage);

    // --- Mobile Menu & Logout Logic ---
    const hamburgerMenu = document.getElementById('hamburger-menu');
    const mainNav = document.querySelector('.main-nav');
    if (hamburgerMenu) {
        hamburgerMenu.addEventListener('click', () => {
            mainNav.classList.toggle('active');
        });
    }
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('currentUser');
            window.location.href = 'login.html';
        });
    }

    // --- DYNAMIC FEEDBACK LOGIC ---
    const feedbackMessages = {
        'new': 'Thank you! New items are greatly appreciated.',
        'good': 'Great! Gently used clothes are perfect for giving someone a fresh start.',
        'fair': 'Thank you. Usable items in any condition can still make a difference.'
    };

    if (conditionSelect) {
        conditionSelect.addEventListener('change', () => {
            const selectedValue = conditionSelect.value;
            if (feedbackMessages[selectedValue]) {
                conditionFeedback.textContent = feedbackMessages[selectedValue];
                conditionFeedback.classList.add('visible');
            } else {
                conditionFeedback.classList.remove('visible');
            }
        });
    }
    
    // --- Prevent picking dates in the past ---
    if (pickupDateInput) {
        const today = new Date().toISOString().split('T')[0];
        pickupDateInput.setAttribute('min', today);
    }

    // --- Donation Form Submission ---
    if (donationForm) {
        donationForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Clear previous messages and disable button
            showMessage(''); 
            submitButton.disabled = true;
            submitButton.textContent = 'Submitting...';

            const items = document.getElementById('donation-items').value.trim();
            const condition = document.getElementById('donation-condition').value;
            const pickupDate = document.getElementById('pickup-date').value;
            const pickupSlot = document.getElementById('pickup-slot').value;

            if (!items || !condition || !pickupDate || !pickupSlot) {
                showMessage('Please fill out all fields.', 'error');
                submitButton.disabled = false;
                submitButton.textContent = 'Schedule Pickup';
                return;
            }

            const result = await apiRequest('/donations', 'POST', {
                phone: currentUser.phone,
                items,
                condition,
                pickupDate,
                pickupSlot
            });

            if (result && result.success) {
                window.location.href = `thankyou.html?id=${result.donationId}`;
            } else {
                // Re-enable the button if there was an error
                submitButton.disabled = false;
                submitButton.textContent = 'Schedule Pickup';
            }
        });
    }

    // --- API Request Helper ---
    async function apiRequest(endpoint, method = 'GET', body = null) {
        try {
            const options = { method, headers: { 'Content-Type': 'application/json' } };
            if (body) options.body = JSON.stringify(body);
            const response = await fetch(`${API_URL}${endpoint}`, options);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('API Request Error:', error);
            // Display a user-friendly error on the form instead of an alert
            showMessage(`Error: ${error.message}. Could not connect to the server.`, 'error');
            return null;
        }
    }

    // --- Helper to show messages on the form ---
    function showMessage(message, type = 'success') {
        formMessage.textContent = message;
        formMessage.style.color = type === 'error' ? '#e74c3c' : '#2ecc71';
        formMessage.style.marginTop = '15px';
    }
});
