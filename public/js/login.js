// Global function for Google sign-in callback
function handleCredentialResponse(response) {
  googleLoginRequest(response.credential);
}
let googleLoginRequest = async (token) => {};

// NEW: We wait for the ENTIRE window to load before setting up Google Sign-In
// This ensures the Google script has finished loading and the 'google' object exists.
window.onload = function () {
    const GOOGLE_CLIENT_ID = "853516383345-4p5d3upi7u7lakahao0htv2bpe762fgl.apps.googleusercontent.com"; // <-- IMPORTANT: SET YOUR CLIENT ID HERE

    google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse
    });

    // Find all custom Google sign-in buttons
    const googleSignInButtons = document.querySelectorAll('.custom-google-btn');
    googleSignInButtons.forEach(button => {
        button.addEventListener('click', () => {
            // This triggers the Google Sign-In pop-up
            google.accounts.id.prompt();
        });
    });
};

document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'http://localhost:3000/api';
    const views = document.querySelectorAll('.view');

    const registerForm = document.getElementById('register-form');
    const loginForm = document.getElementById('login-form');
    const passwordToggle = document.getElementById('passwordToggle');
    const passwordInput = document.getElementById('login-password');
    const loginPhoneInput = document.getElementById('login-phone');
    const registerPhoneInput = document.getElementById('register-phone');
    const loginPhoneWarning = document.getElementById('login-phone-warning');
    const registerPhoneWarning = document.getElementById('register-phone-warning');

    const handlePhoneInput = (inputElement, warningElement) => {
        let sanitizedValue = inputElement.value.replace(/\D/g, '');
        if (sanitizedValue.length > 10) {
            sanitizedValue = sanitizedValue.substring(0, 10);
        }
        if (sanitizedValue.length === 10) {
            warningElement.textContent = '10 digit limit reached';
            warningElement.classList.add('visible');
        } else {
            warningElement.classList.remove('visible');
        }
        inputElement.value = sanitizedValue;
    };
    
    loginPhoneInput.addEventListener('input', () => handlePhoneInput(loginPhoneInput, loginPhoneWarning));
    registerPhoneInput.addEventListener('input', () => handlePhoneInput(registerPhoneInput, registerPhoneWarning));
    
    if (passwordToggle) {
        passwordToggle.addEventListener('click', () => {
            const eyeOpen = passwordToggle.querySelector('.eye-open');
            const eyeClosed = passwordToggle.querySelector('.eye-closed');
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                eyeOpen.style.display = 'none';
                eyeClosed.style.display = 'block';
            } else {
                passwordInput.type = 'password';
                eyeOpen.style.display = 'block';
                eyeClosed.style.display = 'none';
            }
        });
    }

    googleLoginRequest = async (token) => {
        const result = await apiRequest('/auth/google', 'POST', { token });
        if (result && result.success) {
            localStorage.setItem('currentUser', JSON.stringify(result.user));
            window.location.href = 'dashboard.html';
        }
    };

    document.body.addEventListener('click', (event) => {
        const targetElement = event.target.closest('.nav-btn, .nav-link');
        if (targetElement) {
            event.preventDefault();
            const targetViewId = targetElement.getAttribute('data-target');
            showView(targetViewId);
        }
    });

    const showView = (viewId) => {
        views.forEach(view => view.classList.remove('active-view'));
        const targetView = document.getElementById(viewId);
        if (targetView) targetView.classList.add('active-view');
    };
    
    const apiRequest = async (endpoint, method = 'GET', body = null) => {
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
    };
    
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const phone = registerPhoneInput.value;
            if(phone.length !== 10) return alert('Phone number must be exactly 10 digits.');
            
            const result = await apiRequest('/register', 'POST', {
                name: document.getElementById('register-name').value.trim(),
                phone: phone,
                password: document.getElementById('register-password').value.trim(),
                address: document.getElementById('register-address').value.trim(),
            });
            if (result && result.success) {
                alert('Registration successful! Please log in.');
                showView('login-view');
                registerForm.reset();
            }
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const phone = loginPhoneInput.value;
            if(phone.length !== 10) return alert('Phone number must be exactly 10 digits.');

            const result = await apiRequest('/login', 'POST', {
                phone: phone,
                password: document.getElementById('login-password').value.trim(),
            });
            if (result && result.success) {
                localStorage.setItem('currentUser', JSON.stringify(result.user));
                window.location.href = 'dashboard.html';
            }
        });
    }
});