import mongoose from 'mongoose';
import dotenv from 'dotenv';
import colors from 'colors';
import User from '../models/User.js';
import Hotel from '../models/Hotel.js';
import Room from '../models/Room.js';
import Booking from '../models/Booking.js';
import Review from '../models/Review.js';
import connectDB from '../config/db.js';
import bcrypt from 'bcryptjs';

dotenv.config();

connectDB();

const seedData = async () => {
  try {
    await User.deleteMany();
    await Hotel.deleteMany();
    await Room.deleteMany();
    await Booking.deleteMany();
    await Review.deleteMany();

    const salt = await bcrypt.genSalt(12);
    const password = await bcrypt.hash('Password@123', salt);

    const users = await User.insertMany([
      { name: 'Admin User', email: 'admin@bookmystay.com', password, role: 'admin', isActive: true },
      { name: 'Manager One', email: 'manager1@bookmystay.com', password, role: 'manager', isActive: true },
      { name: 'Manager Two', email: 'manager2@bookmystay.com', password, role: 'manager', isActive: true },
      { name: 'User One', email: 'user1@bookmystay.com', password, role: 'user', isActive: true },
      { name: 'User Two', email: 'user2@bookmystay.com', password, role: 'user', isActive: true },
      { name: 'User Three', email: 'user3@bookmystay.com', password, role: 'user', isActive: true }
    ]);

    const admin = users[0]._id;
    const manager1 = users[1]._id;
    const manager2 = users[2]._id;
    const user1 = users[3]._id;
    const user2 = users[4]._id;
    const user3 = users[5]._id;

    const hotelsData = [
      { name: 'Oceanview Backpacker Hostel', owner: manager1, propertyType: 'hostel', starRating: 4, priceFrom: 15, featured: false, address: { street: '12 Beach Rd', city: 'Bali', state: 'Bali', country: 'Indonesia', zip: '80361' }, description: 'Affordable backpacker hostel with ocean views.', policies: { checkIn: '14:00', checkOut: '11:00', cancellation: 'free' }, amenities: ['WiFi', 'Pool', 'Bar', 'Beach Access'], images: ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5'] },
      { name: 'Urban Oasis Boutique', owner: manager1, propertyType: 'boutique', starRating: 5, priceFrom: 120, featured: true, address: { street: '45 Shibuya', city: 'Tokyo', state: 'Tokyo', country: 'Japan', zip: '150-0002' }, description: 'Luxurious boutique hotel in the heart of the city.', policies: { checkIn: '15:00', checkOut: '12:00', cancellation: 'strict' }, amenities: ['WiFi', 'Spa', 'Gym', 'Restaurant'], images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945'] },
      { name: 'Alpine Ski Lodge', owner: manager1, propertyType: 'resort', starRating: 5, priceFrom: 250, featured: true, address: { street: '1 Matterhorn', city: 'Zermatt', state: 'Valais', country: 'Switzerland', zip: '3920' }, description: 'Premium ski resort with stunning mountain views.', policies: { checkIn: '15:00', checkOut: '10:00', cancellation: 'moderate' }, amenities: ['WiFi', 'Spa', 'Restaurant', 'Bar'], images: ['https://images.unsplash.com/photo-1520250497591-112f2f40a3f4'] },
      { name: 'The Grand Plaza', owner: manager1, propertyType: 'hotel', starRating: 5, priceFrom: 320, featured: false, address: { street: '5th Ave', city: 'New York', state: 'NY', country: 'USA', zip: '10001' }, description: 'Iconic luxury hotel in Manhattan.', policies: { checkIn: '15:00', checkOut: '11:00', cancellation: 'strict' }, amenities: ['WiFi', 'Gym', 'Restaurant', 'Bar', 'Parking'], images: ['https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9'] },
      { name: 'Marina Bay Suites', owner: manager1, propertyType: 'hotel', starRating: 5, priceFrom: 280, featured: true, address: { street: '1 Marina Blvd', city: 'Dubai', state: 'Dubai', country: 'UAE', zip: '00000' }, description: 'Spectacular suites overlooking the marina.', policies: { checkIn: '14:00', checkOut: '12:00', cancellation: 'moderate' }, amenities: ['WiFi', 'Pool', 'Spa', 'Gym', 'Restaurant'], images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b'] },
      { name: 'Heritage Palace', owner: manager1, propertyType: 'resort', starRating: 5, priceFrom: 140, featured: false, address: { street: 'Palace Rd', city: 'Jaipur', state: 'Rajasthan', country: 'India', zip: '302001' }, description: 'Experience royal living in this heritage resort.', policies: { checkIn: '12:00', checkOut: '11:00', cancellation: 'free' }, amenities: ['WiFi', 'Pool', 'Restaurant', 'Parking'], images: ['https://images.unsplash.com/photo-1542314831-c6a4d1409b1c'] },
      { name: 'Gateway Residency', owner: manager1, propertyType: 'hotel', starRating: 4, priceFrom: 95, featured: false, address: { street: 'Colaba', city: 'Mumbai', state: 'MH', country: 'India', zip: '400001' }, description: 'Comfortable stay near the Gateway of India.', policies: { checkIn: '14:00', checkOut: '12:00', cancellation: 'moderate' }, amenities: ['WiFi', 'Breakfast', 'AC'], images: ['https://images.unsplash.com/photo-1551882547-ff40eb0d1e9e'] },
      { name: 'Sunset Beach Resort', owner: manager2, propertyType: 'resort', starRating: 4, priceFrom: 110, featured: true, address: { street: 'Baga Beach', city: 'Goa', state: 'Goa', country: 'India', zip: '403516' }, description: 'Beautiful beachfront resort perfect for relaxation.', policies: { checkIn: '13:00', checkOut: '11:00', cancellation: 'free' }, amenities: ['WiFi', 'Pool', 'Beach Access', 'Bar'], images: ['https://images.unsplash.com/photo-1499793983690-e29da59ef1c2'] },
      { name: 'Eiffel View Hotel', owner: manager2, propertyType: 'hotel', starRating: 4, priceFrom: 210, featured: false, address: { street: 'Rue Cler', city: 'Paris', state: 'Ile-de-France', country: 'France', zip: '75007' }, description: 'Charming hotel with views of the Eiffel Tower.', policies: { checkIn: '15:00', checkOut: '11:00', cancellation: 'strict' }, amenities: ['WiFi', 'Breakfast', 'Restaurant'], images: ['https://images.unsplash.com/photo-1502602898657-3e907a5ea82c'] },
      { name: 'Colosseo Boutique', owner: manager2, propertyType: 'boutique', starRating: 4, priceFrom: 175, featured: false, address: { street: 'Via Roma', city: 'Rome', state: 'Lazio', country: 'Italy', zip: '00184' }, description: 'Cozy boutique hotel steps from the Colosseum.', policies: { checkIn: '14:00', checkOut: '11:00', cancellation: 'moderate' }, amenities: ['WiFi', 'Breakfast', 'AC'], images: ['https://images.unsplash.com/photo-1515542622106-78b28af7815b'] },
      { name: 'Thames Riverside Hotel', owner: manager2, propertyType: 'hotel', starRating: 4, priceFrom: 230, featured: false, address: { street: 'South Bank', city: 'London', state: 'London', country: 'UK', zip: 'SE1 9PX' }, description: 'Modern hotel along the River Thames.', policies: { checkIn: '15:00', checkOut: '12:00', cancellation: 'moderate' }, amenities: ['WiFi', 'Gym', 'Restaurant', 'Bar'], images: ['https://images.unsplash.com/photo-1513635269975-59663e0ac1ad'] },
      { name: 'Santorini Cliff Villas', owner: manager2, propertyType: 'villa', starRating: 5, priceFrom: 300, featured: true, address: { street: 'Oia', city: 'Santorini', state: 'South Aegean', country: 'Greece', zip: '84702' }, description: 'Breathtaking cliffside villas with private pools.', policies: { checkIn: '15:00', checkOut: '11:00', cancellation: 'strict' }, amenities: ['WiFi', 'Pool', 'AC', 'Breakfast'], images: ['https://images.unsplash.com/photo-1469854523086-cc02fe5d8800'] },
      { name: 'Bangkok City Hostel', owner: manager2, propertyType: 'hostel', starRating: 3, priceFrom: 25, featured: false, address: { street: 'Khao San Rd', city: 'Bangkok', state: 'Bangkok', country: 'Thailand', zip: '10200' }, description: 'Lively hostel in the backpacker district.', policies: { checkIn: '14:00', checkOut: '12:00', cancellation: 'free' }, amenities: ['WiFi', 'Bar', 'AC'], images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b'] },
      { name: 'Central Park Residences', owner: manager2, propertyType: 'apartment', starRating: 4, priceFrom: 85, featured: false, address: { street: 'Connaught Place', city: 'New Delhi', state: 'Delhi', country: 'India', zip: '110001' }, description: 'Spacious apartments for long stays.', policies: { checkIn: '14:00', checkOut: '12:00', cancellation: 'moderate' }, amenities: ['WiFi', 'Kitchen', 'AC', 'Parking'], images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267'] }
    ];

    const hotels = await Hotel.insertMany(hotelsData.map(h => ({
      ...h,
      slug: h.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
      status: 'approved',
      location: { lat: 0, lng: 0 }
    })));

    let allRooms = [];
    for (const hotel of hotels) {
      if (hotel.propertyType === 'hostel') {
        allRooms.push({ hotel: hotel._id, name: 'Dorm Bed', roomNumber: '101', type: 'dorm', pricePerNight: hotel.priceFrom, capacity: 1, beds: 1, quantity: 5, amenities: ['WiFi', 'Locker'] });
        allRooms.push({ hotel: hotel._id, name: 'Private Room', roomNumber: '102', type: 'double', pricePerNight: hotel.priceFrom * 2, capacity: 2, beds: 1, quantity: 2, amenities: ['WiFi', 'AC'] });
      } else {
        allRooms.push({ hotel: hotel._id, name: 'Standard Single', roomNumber: '101', type: 'single', pricePerNight: hotel.priceFrom, capacity: 1, beds: 1, quantity: 5, amenities: ['WiFi', 'TV'] });
        allRooms.push({ hotel: hotel._id, name: 'Standard Double', roomNumber: '102', type: 'double', pricePerNight: hotel.priceFrom * 1.4, capacity: 2, beds: 1, quantity: 4, amenities: ['WiFi', 'TV', 'AC'] });
        allRooms.push({ hotel: hotel._id, name: 'Deluxe Room', roomNumber: '201', type: 'deluxe', pricePerNight: hotel.priceFrom * 1.9, capacity: 3, beds: 2, quantity: 3, amenities: ['WiFi', 'TV', 'AC', 'Minibar'] });
        allRooms.push({ hotel: hotel._id, name: 'Suite', roomNumber: '301', type: 'suite', pricePerNight: hotel.priceFrom * 3, capacity: 4, beds: 2, quantity: 2, amenities: ['WiFi', 'TV', 'AC', 'Minibar', 'Balcony'] });
      }
    }
    const rooms = await Room.insertMany(allRooms);

    // Helper for dates
    const getDates = (daysOffset, length) => {
      const checkIn = new Date();
      checkIn.setDate(checkIn.getDate() + daysOffset);
      const checkOut = new Date(checkIn);
      checkOut.setDate(checkOut.getDate() + length);
      return { checkIn, checkOut };
    };

    const makeBooking = (user, hotelIndex, offset, length, status, paymentStatus) => {
      const hotel = hotels[hotelIndex];
      const room = rooms.find(r => r.hotel.toString() === hotel._id.toString());
      const dates = getDates(offset, length);
      const subtotal = room.pricePerNight * length;
      const taxes = subtotal * 0.12;
      const serviceFee = subtotal * 0.03;
      const total = subtotal + taxes + serviceFee;

      return {
        user, hotel: hotel._id, room: room._id,
        checkIn: dates.checkIn, checkOut: dates.checkOut,
        nights: length, guests: { adults: 1, children: 0 }, rooms: 1,
        priceBreakdown: { subtotal, taxes, serviceFee, total }, totalPrice: total,
        status, paymentStatus, paymentMethod: paymentStatus === 'paid' ? 'Credit Card' : undefined,
        guestDetails: { fullName: 'Test Guest', email: 'guest@example.com', phone: '1234567890' },
        bookingRef: 'BMS-' + Math.random().toString(36).substr(2, 6).toUpperCase()
      };
    };

    const bookingsData = [
      // 6 completed
      makeBooking(user1, 0, -10, 3, 'completed', 'paid'),
      makeBooking(user1, 1, -15, 2, 'completed', 'paid'),
      makeBooking(user2, 2, -20, 5, 'completed', 'paid'),
      makeBooking(user2, 3, -5, 2, 'completed', 'paid'),
      makeBooking(user3, 4, -8, 4, 'completed', 'paid'),
      makeBooking(user3, 5, -12, 3, 'completed', 'paid'),
      // 4 upcoming confirmed paid
      makeBooking(user1, 6, 5, 3, 'confirmed', 'paid'),
      makeBooking(user2, 7, 10, 4, 'confirmed', 'paid'),
      makeBooking(user3, 8, 15, 2, 'confirmed', 'paid'),
      makeBooking(user1, 9, 20, 5, 'confirmed', 'paid'),
      // 2 confirmed unpaid, 2 cancelled (1 ref), 1 pending
      makeBooking(user2, 10, 12, 3, 'confirmed', 'unpaid'),
      makeBooking(user3, 11, 25, 4, 'confirmed', 'unpaid'),
      makeBooking(user1, 12, 30, 2, 'cancelled', 'refunded'),
      makeBooking(user2, 13, 8, 3, 'cancelled', 'unpaid'),
      makeBooking(user3, 0, 18, 2, 'pending', 'unpaid'),
    ];

    const insertedBookings = await Booking.insertMany(bookingsData);

    // Reviews
    const reviewsData = [
      { user: user1, hotel: hotels[0]._id, booking: insertedBookings[0]._id, rating: 4, title: 'Great stay', comment: 'Loved the vibe.' },
      { user: user1, hotel: hotels[1]._id, booking: insertedBookings[1]._id, rating: 5, title: 'Amazing', comment: 'Incredible experience.' },
      { user: user2, hotel: hotels[2]._id, booking: insertedBookings[2]._id, rating: 5, title: 'Ski paradise', comment: 'Best resort ever.' },
      { user: user2, hotel: hotels[3]._id, booking: insertedBookings[3]._id, rating: 4, title: 'Good value', comment: 'Nice location.' },
      { user: user3, hotel: hotels[4]._id, booking: insertedBookings[4]._id, rating: 5, title: 'Luxury', comment: 'Pure luxury.' },
      { user: user3, hotel: hotels[5]._id, booking: insertedBookings[5]._id, rating: 3, title: 'Okay', comment: 'Average stay.' },
    ];
    await Review.insertMany(reviewsData);

    // Update hotel ratings
    for (const h of hotels) {
      const stats = await Review.aggregate([{ $match: { hotel: h._id } }, { $group: { _id: '$hotel', avg: { $avg: '$rating' }, count: { $sum: 1 } } }]);
      if (stats.length > 0) {
        await Hotel.findByIdAndUpdate(h._id, { avgRating: stats[0].avg, reviewCount: stats[0].count });
      }
    }

    // Wishlists
    await User.findByIdAndUpdate(user1, { $push: { wishlist: { $each: [hotels[0]._id, hotels[1]._id] } } });
    await User.findByIdAndUpdate(user2, { $push: { wishlist: { $each: [hotels[2]._id, hotels[3]._id] } } });

    console.log('Data Imported!'.green.inverse);
    process.exit();
  } catch (error) {
    console.error(`${error}`.red.inverse);
    process.exit(1);
  }
};

seedData();
