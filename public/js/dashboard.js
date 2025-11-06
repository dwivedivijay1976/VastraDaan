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
    const welcomeMessage = document.getElementById('welcome-message');
    const logoutBtn = document.getElementById('logout-btn');
    const hamburgerMenu = document.getElementById('hamburger-menu');
    const mainNav = document.querySelector('.main-nav');

    // NEW: DOM references for earnings modal
    const earningsModal = document.getElementById("earnings-modal");
    const showEarningsLink = document.getElementById("show-earnings-link"); 
    const closeBtn = document.querySelector(".close-btn");
    const earningsDisplay = document.getElementById("total-earnings-display");

    // --- INITIALIZE PAGE ---
    if (welcomeMessage) {
        welcomeMessage.textContent = `Welcome, ${currentUser.name}!`;
    }

    // Initialize Earnings Display
    const userEarnings = currentUser.earnings || 0;
    if (earningsDisplay) {
        earningsDisplay.textContent = `$${userEarnings.toFixed(2)}`;
    }

    // --- HAMBURGER MENU TOGGLE ---
    if (hamburgerMenu) {
        hamburgerMenu.addEventListener('click', () => {
            mainNav.classList.toggle('active');
        });
    }

    // --- EARNINGS MODAL FUNCTIONALITY ---
    if (showEarningsLink) {
        showEarningsLink.onclick = function(event) {
            event.preventDefault(); 
            earningsModal.style.display = "block";
        }
    }

    if (closeBtn) {
        closeBtn.onclick = function() {
            earningsModal.style.display = "none";
        }
    }

    window.onclick = function(event) {
        if (event.target == earningsModal) {
            earningsModal.style.display = "none";
        }
    }

    // ========================================================
    // 🌿 GLASSY LOGOUT POPUP MODAL (Matches Vastradaan theme)
    // ========================================================
    const showLogoutPopup = () => {
        const popup = document.createElement('div');
        popup.innerHTML = `
            <div style="
                position: fixed;
                top: 0; left: 0;
                width: 100%; height: 100%;
                display: flex;
                justify-content: center;
                align-items: center;
                background: rgba(0, 0, 0, 0.2);
                backdrop-filter: blur(8px);
                -webkit-backdrop-filter: blur(8px);
                z-index: 9999;
                font-family: 'Poppins', sans-serif;
                animation: fadeIn 0.3s ease-in-out;
            ">
                <div style="
                    background: rgba(255, 255, 255, 0.25);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    border-radius: 16px;
                    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
                    backdrop-filter: blur(10px);
                    -webkit-backdrop-filter: blur(10px);
                    padding: 30px 40px;
                    text-align: center;
                    color: #222;
                    width: 320px;
                ">
                    <h3 style="margin-bottom: 20px; font-weight: 600;">
                        Are you sure you want to log out?
                    </h3>
                    <div style="margin-top: 15px;">
                        <button id="confirm-logout" style="
                            background-color: #2ecc71;
                            border: none;
                            color: white;
                            padding: 10px 20px;
                            border-radius: 6px;
                            font-weight: 600;
                            cursor: pointer;
                            transition: all 0.3s ease;
                        ">Yes, Logout</button>
                        <button id="cancel-logout" style="
                            background-color: transparent;
                            border: 1px solid #2ecc71;
                            color: #2ecc71;
                            padding: 10px 20px;
                            border-radius: 6px;
                            font-weight: 600;
                            margin-left: 10px;
                            cursor: pointer;
                            transition: all 0.3s ease;
                        ">Cancel</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(popup);

        // --- Event Handlers ---
        document.getElementById('confirm-logout').onclick = () => {
            localStorage.removeItem('currentUser');
            window.location.href = 'login.html';
        };

        document.getElementById('cancel-logout').onclick = () => {
            popup.remove();
        };
    };

    // --- Attach Glassy Popup to Logout Button ---
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (event) => {
            event.preventDefault();
            showLogoutPopup();
        });

        // Also restyle your logout button to match your green theme
        logoutBtn.style.backgroundColor = '#2ecc71';
        logoutBtn.style.color = 'white';
        logoutBtn.style.border = 'none';
        logoutBtn.style.padding = '8px 18px';
        logoutBtn.style.borderRadius = '6px';
        logoutBtn.style.fontWeight = '500';
        logoutBtn.style.cursor = 'pointer';
        logoutBtn.style.transition = '0.3s';
        logoutBtn.onmouseover = () => (logoutBtn.style.opacity = '0.8');
        logoutBtn.onmouseout = () => (logoutBtn.style.opacity = '1');
    }
});
