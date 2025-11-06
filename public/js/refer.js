document.addEventListener('DOMContentLoaded', () => {
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
    const referralCodeDiv = document.getElementById('referral-code');
    const copyCodeBtn = document.getElementById('copy-code-btn');

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

    // --- Refer & Earn Logic ---
    // UPDATED: This function is now smarter and handles both phone numbers and emails
    function generateReferralCode() {
        const nameIdentifier = currentUser.name.substring(0, 0).toUpperCase();
        let userIdentifier;

        // Check if the 'phone' field contains an '@', which means it's an email
        if (currentUser.phone.includes('@')) {
            // If it's an email, take the first 4 characters from the part before the '@'
            userIdentifier = currentUser.phone.split('@')[0].substring(0, 2).toUpperCase();
        } else {
            // If it's a normal phone number, use the last 4 digits as before
            userIdentifier = currentUser.phone.slice(-3);
        }
        
        // This now creates a correct code for both user types
        referralCodeDiv.textContent = `${nameIdentifier}DONATE${userIdentifier}`;
    }

    function copyReferralCode() {
        const code = referralCodeDiv.textContent;
        navigator.clipboard.writeText(code).then(() => {
            alert(`Referral code "${code}" copied to clipboard!`);
        });
    }

    if (copyCodeBtn) {
        copyCodeBtn.addEventListener('click', copyReferralCode);
    }

    // Generate the code as soon as the page loads
    generateReferralCode();
});