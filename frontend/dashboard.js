document.addEventListener('DOMContentLoaded', () => {
    const role = localStorage.getItem('role');
    const user_id = localStorage.getItem('user_id');
    if (!role || !user_id) window.location.href = 'index.html';

    if (role === 'admin') {
        document.getElementById('admin-section').style.display = 'block';
        fetchHallsAdmin();
        document.getElementById('add-hall-form').addEventListener('submit', addHall);
    } else if (role === 'user') {
        document.getElementById('user-section').style.display = 'block';
        fetchHallsUser();
        fetchMyBookings(user_id);
        document.getElementById('book-hall-form').addEventListener('submit', bookHall);
        document.getElementById('review-form').addEventListener('submit', addReview);
    }

    document.getElementById('logout').addEventListener('click', () => {
        localStorage.removeItem('role');
        localStorage.removeItem('user_id');
        window.location.href = 'index.html';
    });
});

function fetchHallsAdmin() {
    fetch('http://localhost:5000/halls')
        .then(response => response.json())
        .then(data => {
            const hallList = document.getElementById('hall-list-admin');
            hallList.innerHTML = '';
            data.forEach(hall => {
                const div = document.createElement('div');
                div.className = 'hall';
                div.innerHTML = `
                    <h3>${hall.name}</h3>
                    <p>Capacity: ${hall.capacity}</p>
                    <p>Price: ₹${hall.price}</p>
                    <p>ID: ${hall.id}</p>
                    <button onclick="deleteHall(${hall.id})">Delete</button>
                `;
                hallList.appendChild(div);
            });
        });
}

function addHall(e) {
    e.preventDefault();
    const name = document.getElementById('hall-name').value;
    const capacity = parseInt(document.getElementById('capacity').value);
    const price = parseFloat(document.getElementById('price').value);

    fetch('http://localhost:5000/halls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, capacity, price })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) fetchHallsAdmin();
    });
}

function deleteHall(hallId) {
    fetch(`http://localhost:5000/halls/${hallId}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) fetchHallsAdmin();
    });
}

function fetchHallsUser() {
    fetch('http://localhost:5000/halls')
        .then(response => response.json())
        .then(data => {
            const hallList = document.getElementById('hall-list-user');
            hallList.innerHTML = '';
            data.forEach(hall => {
                const div = document.createElement('div');
                div.className = 'hall';
                div.innerHTML = `
                    <h3>${hall.name}</h3>
                    <p>Capacity: ${hall.capacity}</p>
                    <p>Price: ₹${hall.price}</p>
                    <p>ID: ${hall.id}</p>
                    <button onclick="fetchReviews(${hall.id})">View Reviews</button>
                `;
                hallList.appendChild(div);
            });
        });
}

function bookHall(e) {
    e.preventDefault();
    const hall_id = parseInt(document.getElementById('hall-id').value);
    const booking_date = document.getElementById('booking-date').value;
    const user_id = localStorage.getItem('user_id');
    const status = document.getElementById('booking-status');

    fetch('http://localhost:5000/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hall_id, booking_date, user_id })
    })
    .then(response => response.json())
    .then(data => {
        status.textContent = data.message || data.error;
        if (data.message) fetchMyBookings(user_id);
    });
}

function fetchMyBookings(user_id) {
    fetch(`http://localhost:5000/my-bookings/${user_id}`)
        .then(response => response.json())
        .then(data => {
            const bookings = document.getElementById('my-bookings');
            bookings.innerHTML = '';
            data.forEach(booking => {
                const div = document.createElement('div');
                div.innerHTML = `
                    <p>Hall ID: ${booking.hall_id}</p>
                    <p>Date: ${booking.booking_date}</p>
                    <p>Status: ${booking.status}</p>
                    ${booking.status === 'confirmed' ? `<button onclick="cancelBooking(${booking.id})">Cancel</button>` : ''}
                `;
                bookings.appendChild(div);
            });
        });
}

function cancelBooking(bookingId) {
    fetch(`http://localhost:5000/bookings/${bookingId}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) fetchMyBookings(localStorage.getItem('user_id'));
    });
}

function addReview(e) {
    e.preventDefault();
    const hall_id = parseInt(document.getElementById('review-hall-id').value);
    const rating = parseInt(document.getElementById('rating').value);
    const comment = document.getElementById('comment').value;
    const user_id = localStorage.getItem('user_id');

    fetch('http://localhost:5000/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hall_id, rating, comment, user_id })
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('review-status').textContent = data.message || data.error;
    });
}

function fetchReviews(hallId) {
    fetch(`http://localhost:5000/halls/${hallId}/reviews`)
        .then(response => response.json())
        .then(data => {
            if (data.length === 0) {
                alert('No reviews available for this hall.');
            } else {
                let reviewText = 'Reviews for Hall ID ' + hallId + ':\n\n';
                data.forEach(review => {
                    reviewText += `User ${review.user_id}:\n`;
                    reviewText += `Rating: ${review.rating}/5\n`;
                    reviewText += `Comment: ${review.comment || 'No comment'}\n`;
                    reviewText += '------------------------\n';
                });
                alert(reviewText);
            }
        })
        .catch(error => {
            console.error('Error fetching reviews:', error);
            alert('Error loading reviews for Hall ID ' + hallId);
        });
}