from flask import Blueprint, jsonify, request
from .models import Hall, Booking, User, Review
from . import db
from datetime import datetime

main_routes = Blueprint('main', __name__)

@main_routes.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(username=data['username']).first()
    if user and user.check_password(data['password']):
        return jsonify({'id': user.id, 'role': user.role}), 200
    return jsonify({'error': 'Invalid credentials'}), 401

@main_routes.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already exists'}), 400
    user = User(username=data['username'], role='user')
    user.set_password(data['password'])
    db.session.add(user)
    db.session.commit()
    return jsonify({'message': 'User registered successfully', 'id': user.id}), 201

@main_routes.route('/halls', methods=['GET'])
def get_halls():
    halls = Hall.query.all()
    return jsonify([{'id': hall.id, 'name': hall.name, 'capacity': hall.capacity, 'price': hall.price} for hall in halls])

@main_routes.route('/halls', methods=['POST'])
def create_hall():
    data = request.get_json()
    new_hall = Hall(name=data['name'], capacity=data['capacity'], price=data['price'])
    db.session.add(new_hall)
    db.session.commit()
    return jsonify({'message': 'Hall created successfully', 'id': new_hall.id}), 201

@main_routes.route('/halls/<int:hall_id>', methods=['DELETE'])
def delete_hall(hall_id):
    hall = Hall.query.get_or_404(hall_id)
    db.session.delete(hall)
    db.session.commit()
    return jsonify({'message': 'Hall deleted successfully'}), 200

@main_routes.route('/bookings', methods=['POST'])
def create_booking():
    data = request.get_json()
    booking_date = datetime.fromisoformat(data['booking_date'])
    hall_id = data['hall_id']
    user_id = data['user_id']

    # Extract only the date portion (ignoring time)
    booking_date_only = booking_date.date()

    # Check if the hall is already booked on the same day (ignoring time)
    existing_booking = Booking.query.filter(
        Booking.hall_id == hall_id,
        db.func.date(Booking.booking_date) == booking_date_only,
        Booking.status == 'confirmed'
    ).first()

    if existing_booking:
        return jsonify({'error': 'This hall is already booked for this day'}), 400

    # If no conflict, create the booking
    new_booking = Booking(user_id=user_id, hall_id=hall_id, booking_date=booking_date)
    db.session.add(new_booking)
    db.session.commit()
    return jsonify({'message': 'Booking created successfully', 'id': new_booking.id}), 201

@main_routes.route('/bookings/<int:booking_id>', methods=['DELETE'])
def cancel_booking(booking_id):
    booking = Booking.query.get_or_404(booking_id)
    booking.status = 'cancelled'
    db.session.commit()
    return jsonify({'message': 'Booking cancelled successfully'}), 200

@main_routes.route('/my-bookings/<int:user_id>', methods=['GET'])
def get_my_bookings(user_id):
    bookings = Booking.query.filter_by(user_id=user_id).all()
    return jsonify([{
        'id': b.id, 'hall_id': b.hall_id, 'booking_date': b.booking_date.isoformat(), 'status': b.status
    } for b in bookings])

@main_routes.route('/availability', methods=['POST'])
def check_availability():
    data = request.get_json()
    hall_id = data['hall_id']
    booking_date = datetime.fromisoformat(data['booking_date'])
    existing_booking = Booking.query.filter_by(hall_id=hall_id, booking_date=booking_date, status='confirmed').first()
    return jsonify({'available': not bool(existing_booking)}), 200

@main_routes.route('/reviews', methods=['POST'])
def add_review():
    data = request.get_json()
    review = Review(user_id=data['user_id'], hall_id=data['hall_id'], rating=data['rating'], comment=data['comment'])
    db.session.add(review)
    db.session.commit()
    return jsonify({'message': 'Review added successfully'}), 201

@main_routes.route('/halls/<int:hall_id>/reviews', methods=['GET'])
def get_hall_reviews(hall_id):
    reviews = Review.query.filter_by(hall_id=hall_id).all()
    return jsonify([{
        'id': r.id, 'user_id': r.user_id, 'rating': r.rating, 'comment': r.comment
    } for r in reviews])