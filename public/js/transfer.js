document.addEventListener('DOMContentLoaded', () => {
    // --- PAGE PROTECTION & DATA ---
    const userString = localStorage.getItem('currentUser');
    if (!userString) {
        window.location.href = 'login.html'; // Redirect if not logged in
        return;
    }
    const currentUser = JSON.parse(userString);
    const userEarnings = currentUser.earnings || 0;

    // --- DOM REFERENCES ---
    const currentBalanceDisplay = document.getElementById('current-balance');
    const transferForm = document.getElementById('transfer-form');
    const upiIdInput = document.getElementById('upi-id');
    const amountInput = document.getElementById('amount');
    const messageDisplay = document.getElementById('message-display');

    // --- INITIALIZE PAGE ---
    currentBalanceDisplay.textContent = `₹${userEarnings.toFixed(2)}`;

    // --- EVENT LISTENER FOR FORM SUBMISSION ---
    transferForm.addEventListener('submit', (event) => {
        event.preventDefault(); // Prevent form from reloading the page

        const upiId = upiIdInput.value.trim();
        const amount = parseFloat(amountInput.value);

        // --- VALIDATION ---
        if (!upiId || amount <= 0 || !amount) {
            showMessage('Please enter a valid UPI ID and amount.', 'error');
            return;
        }

        if (amount > userEarnings) {
            showMessage('Transfer amount cannot be greater than your balance.', 'error');
            return;
        }

        // --- SIMULATE TRANSFER ---
        // In a real application, you would send this data to your server
        // to process the payment via a payment gateway API.
        
        showMessage(`Processing transfer of ₹${amount.toFixed(2)} to ${upiId}...`, 'success');

        // Disable form to prevent multiple submissions
        upiIdInput.disabled = true;
        amountInput.disabled = true;
        document.querySelector('.action-btn').disabled = true;
        document.querySelector('.action-btn').textContent = 'Processing...';

        // Simulate a delay for the transaction
        setTimeout(() => {
            // Update the user's balance
            const newBalance = userEarnings - amount;
            currentUser.earnings = newBalance;

            // Save the updated user data back to localStorage
            localStorage.setItem('currentUser', JSON.stringify(currentUser));

            // Show success message and redirect
            showMessage(`Transfer successful! Your new balance is ₹${newBalance.toFixed(2)}.`, 'success');
            
            setTimeout(() => {
                window.location.href = 'dashboard.html'; // Go back to dashboard after success
            }, 2500); // Wait 2.5 seconds before redirecting

        }, 2000); // Simulate a 2-second processing time
    });

    // --- HELPER FUNCTION TO SHOW MESSAGES ---
    function showMessage(text, type) {
        messageDisplay.textContent = text;
        messageDisplay.className = `message ${type}`; // e.g., 'message success' or 'message error'
    }
});
