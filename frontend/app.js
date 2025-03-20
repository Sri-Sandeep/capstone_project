document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login');
    const registerForm = document.getElementById('register');
    const showRegister = document.getElementById('show-register');

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const status = document.getElementById('login-status');

        fetch('http://localhost:5000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        })
        .then(response => response.json())
        .then(data => {
            if (data.id && data.role) {
                localStorage.setItem('user_id', data.id);
                localStorage.setItem('role', data.role);
                window.location.href = 'dashboard.html';
            } else {
                status.textContent = data.error;
            }
        })
        .catch(() => {
            status.textContent = 'Error logging in';
        });
    });

    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('reg-username').value;
        const password = document.getElementById('reg-password').value;

        fetch('http://localhost:5000/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        })
        .then(response => response.json())
        .then(data => {
            document.getElementById('register-status').textContent = data.message || data.error;
            if (data.id) {
                localStorage.setItem('user_id', data.id);
                localStorage.setItem('role', 'user');
                window.location.href = 'dashboard.html';
            }
        });
    });

    showRegister.addEventListener('click', () => {
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('register-form').style.display = 'block';
    });
});