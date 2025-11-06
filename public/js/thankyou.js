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

    // --- Mobile Menu & Logout Logic ---
    const hamburgerMenu = document.getElementById('hamburger-menu');
    const mainNav = document.querySelector('.main-nav');
     if (hamburgerMenu) {
        hamburgerMenu.addEventListener('click', () => { mainNav.classList.toggle('active'); });
    }
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('currentUser');
            window.location.href = 'login.html';
        });
    }

    // --- RECEIPT LOGIC ---
    const receiptId = document.getElementById('receipt-id');
    const receiptItems = document.getElementById('receipt-items');
    const receiptCondition = document.getElementById('receipt-condition');
    const receiptDate = document.getElementById('receipt-date');
    const receiptSlot = document.getElementById('receipt-slot');
    const qrcodeDiv = document.getElementById('qrcode');

    // Get the donation ID from the URL
    const params = new URLSearchParams(window.location.search);
    const donationId = params.get('id');

    async function fetchDonationDetails() {
        if (!donationId) {
            alert('No donation ID found.');
            return;
        }

        const result = await apiRequest(`/donations/${donationId}`);
        if (result && result.success) {
            const donation = result.donation;

            // Populate the receipt details on the page
            receiptId.textContent = donation.id;
            receiptItems.textContent = donation.items;
            receiptCondition.textContent = donation.condition;
            receiptDate.textContent = new Date(donation.pickup_date).toLocaleDateString();
            receiptSlot.textContent = donation.pickup_slot;
            
            // Generate QR Code
            const qrText = `Donation ID: ${donation.id}, Items: ${donation.items}, Status: Scheduled`;
            new QRCode(qrcodeDiv, { text: qrText, width: 128, height: 128 });
        } else {
            alert('Could not fetch donation details.');
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
    fetchDonationDetails();
});