import mongoose from 'mongoose';
import dotenv from 'dotenv';
import colors from 'colors';
import User from '../models/User.js';
import Hotel from '../models/Hotel.js';
import Room from '../models/Room.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const cities = [
  { city: 'Ahmedabad', state: 'Gujarat', country: 'India' },
  { city: 'Surat', state: 'Gujarat', country: 'India' },
  { city: 'Bangalore', state: 'Karnataka', country: 'India' },
  { city: 'New York', state: 'New York', country: 'USA' },
  { city: 'London', state: 'London', country: 'UK' },
  { city: 'Dubai', state: 'Dubai', country: 'UAE' },
  { city: 'Paris', state: 'Ile-de-France', country: 'France' },
  { city: 'New Delhi', state: 'Delhi', country: 'India' },
];

const hotelNames = ['Grand Plaza', 'Royal Palace', 'City Center Stay', 'Luxury Inn'];
const images = [
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
  'https://images.unsplash.com/photo-1542314831-c6a4d1409b1c?w=800',
  'https://images.unsplash.com/photo-1551882547-ff40eb0d8173?w=800',
];

const seedExtraHotels = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB Connected');
    
    let manager = await User.findOne({ role: 'manager' });
    if (!manager) {
      manager = await User.create({
        name: 'Demo Manager',
        email: 'manager_demo@bookmystay.com',
        password: 'Password123',
        role: 'manager'
      });
      console.log('Created Demo Manager');
    }

    let hotelsData = [];

    for (let c of cities) {
      for (let i = 0; i < 4; i++) {
        const hotelName = `${c.city} ${hotelNames[i]}`;
        hotelsData.push({
          name: hotelName,
          slug: hotelName.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substring(2, 7),
          owner: manager._id,
          propertyType: 'hotel',
          starRating: 4 + (i % 2),
          priceFrom: 100 + (i * 50),
          featured: i === 0,
          address: {
            street: `Main St ${i + 1}`,
            city: c.city,
            state: c.state,
            country: c.country,
            zip: '1000' + i,
          },
          description: `A beautiful ${hotelNames[i].toLowerCase()} located in the heart of ${c.city}.`,
          policies: {
            checkIn: '14:00',
            checkOut: '11:00',
            cancellation: 'moderate',
          },
          amenities: ['WiFi', 'Pool', 'Restaurant', 'Gym', 'AC'],
          images: [images[i]],
          status: 'approved',
          location: { lat: 0, lng: 0 }
        });
      }
    }

    const insertedHotels = await Hotel.insertMany(hotelsData);
    console.log(`Inserted ${insertedHotels.length} hotels.`);

    let allRooms = [];
    for (const hotel of insertedHotels) {
      allRooms.push({ hotel: hotel._id, name: 'Standard Room', roomNumber: '101', type: 'double', pricePerNight: hotel.priceFrom, capacity: 2, beds: 1, quantity: 5, amenities: ['WiFi', 'TV', 'AC'] });
      allRooms.push({ hotel: hotel._id, name: 'Deluxe Room', roomNumber: '201', type: 'deluxe', pricePerNight: hotel.priceFrom * 1.5, capacity: 3, beds: 2, quantity: 3, amenities: ['WiFi', 'TV', 'AC', 'Minibar'] });
    }
    
    await Room.insertMany(allRooms);
    console.log(`Inserted ${allRooms.length} rooms.`);

    console.log('Data Imported Successfully!'.green.inverse);
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedExtraHotels();
