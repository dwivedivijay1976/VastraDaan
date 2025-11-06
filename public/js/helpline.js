document.addEventListener('DOMContentLoaded', () => {
    // --- PAGE PROTECTION ---
    const userString = localStorage.getItem('currentUser');
    if (!userString) {
        window.location.href = 'login.html';
        return;
    }
    
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

    // --- NEW: Contact Form Logic ---
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Prevent the form from actually submitting
            
            // In a real application, you would send this data to your server.
            // For now, we will just show a success message.
            
            alert('Thank you for your message! Our team will get back to you shortly.');
            
            // Clear the form fields
            contactForm.reset();
        });
    }
});