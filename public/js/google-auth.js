// Google Authentication
const initGoogleAuth = () => {
    // Load the Google API client library
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/platform.js';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    // Initialize Google Sign-In
    script.onload = () => {
        gapi.load('auth2', () => {
            gapi.auth2.init({
                client_id: 'YOUR_GOOGLE_CLIENT_ID', // Replace with your Google Client ID
                scope: 'profile email'
            }).then(() => {
                console.log('Google Auth initialized');
            });
        });
    };
};

// Handle Google Sign-In
const handleGoogleSignIn = async () => {
    try {
        const auth2 = gapi.auth2.getAuthInstance();
        const googleUser = await auth2.signIn();
        const idToken = googleUser.getAuthResponse().id_token;
        
        // Send the token to your backend
        const response = await fetch('/api/auth/google', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ idToken })
        });

        const data = await response.json();

        if (data.success) {
            // Save token and redirect
            localStorage.setItem('token', data.token);
            window.location.href = '/dashboard.html';
        } else {
            showAlert(data.error, 'error');
        }
    } catch (err) {
        showAlert('Error signing in with Google', 'error');
    }
};

// Add Google Sign-In button to the page
const addGoogleSignInButton = () => {
    const authSection = document.getElementById('auth-section');
    if (authSection) {
        const googleButton = document.createElement('button');
        googleButton.className = 'flex items-center justify-center bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded hover:bg-gray-50 transition';
        googleButton.innerHTML = `
            <img src="/img/google-icon.png" alt="Google" class="w-5 h-5 mr-2">
            Sign in with Google
        `;
        googleButton.onclick = handleGoogleSignIn;
        authSection.appendChild(googleButton);
    }
};

// Initialize Google Auth when the page loads
document.addEventListener('DOMContentLoaded', () => {
    initGoogleAuth();
    addGoogleSignInButton();
}); 