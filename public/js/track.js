document.addEventListener('DOMContentLoaded', () => {
     const API_URL = 'http://10.45.136.3:3000/api'; // <-- IMPORTANT: SET YOUR IP HERE
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
    const donationIdEl = document.getElementById('donation-id');
    const statusPillEl = document.getElementById('status-pill');
    const pickupAddressEl = document.getElementById('pickup-address');
    const packageItemsEl = document.getElementById('package-items');
    const packageConditionEl = document.getElementById('package-condition');
    const pickupPointEl = document.getElementById('pickup-point');
    const deliveryPointEl = document.getElementById('delivery-point');

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

    // --- Tracking Logic ---
    async function fetchDonationStatus() {
        const history = await apiRequest(`/donations/user/${currentUser.phone}`);
        if (history && history.donations.length > 0) {
            const latestDonation = history.donations[0];
            
            // Populate the card with donation details
            donationIdEl.textContent = `PD-${latestDonation.id.toString().padStart(8, '0')}`;
            pickupAddressEl.textContent = currentUser.address;
            packageItemsEl.textContent = latestDonation.items;
            packageConditionEl.textContent = latestDonation.condition;
            
            // Fetch the mocked status
            const trackingResult = await apiRequest(`/tracking/${latestDonation.id}`);
            if (trackingResult && trackingResult.success) {
                const status = trackingResult.status;
                statusPillEl.textContent = status;

                // Update the timeline visual based on the status
                pickupPointEl.classList.add('active'); // Pickup is always the first active step
                
                // If the status is past pickup, mark the delivery point as active too
                const pickedUpStatuses = ['Picked Up', 'Processing at Center', 'Donated & Delivered'];
                if (pickedUpStatuses.includes(status)) {
                    deliveryPointEl.classList.add('active');
                }
            }
        } else {
            donationIdEl.textContent = 'No Donations Found';
            statusPillEl.textContent = 'Inactive';
            pickupAddressEl.textContent = 'Please make a donation to start tracking.';
        }
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
            alert(`Error: ${error.message}`);
            return null;
        }
    }

    // --- INITIALIZE PAGE ---
    fetchDonationStatus();
});