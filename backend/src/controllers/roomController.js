import Room from '../models/Room.js';
import Hotel from '../models/Hotel.js';
import Booking from '../models/Booking.js';

// @desc    Get rooms for a hotel
// @route   GET /api/hotels/:hotelId/rooms
// @access  Public
export const getRooms = async (req, res, next) => {
  try {
    const { checkIn, checkOut, guests } = req.query;
    const hotelId = req.params.hotelId;

    const query = { hotel: hotelId, isAvailable: true };
    if (guests) {
      query.capacity = { $gte: parseInt(guests) };
    }

    const rooms = await Room.find(query);

    // If dates are provided, calculate available units per room
    if (checkIn && checkOut) {
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);

      const overlappingBookings = await Booking.find({
        hotel: hotelId,
        $or: [
          { checkIn: { $lt: checkOutDate }, checkOut: { $gt: checkInDate } }
        ],
        status: { $in: ['pending', 'confirmed'] }
      });

      const bookedCounts = {};
      for (const b of overlappingBookings) {
        const roomId = b.room.toString();
        bookedCounts[roomId] = (bookedCounts[roomId] || 0) + b.rooms;
      }

      const roomsWithAvailability = rooms.map(room => {
        const booked = bookedCounts[room._id.toString()] || 0;
        const availableUnits = Math.max(0, room.quantity - booked);
        return { ...room.toObject(), availableUnits };
      });

      return res.status(200).json({ success: true, data: roomsWithAvailability });
    }

    res.status(200).json({ success: true, data: rooms });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single room availability
// @route   GET /api/rooms/:id/availability
// @access  Public
export const getRoomAvailability = async (req, res, next) => {
  try {
    const { checkIn, checkOut } = req.query;
    if (!checkIn || !checkOut) {
      return res.status(400).json({ success: false, message: 'Please provide checkIn and checkOut dates' });
    }

    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    const overlappingBookings = await Booking.find({
      room: room._id,
      $or: [
        { checkIn: { $lt: checkOutDate }, checkOut: { $gt: checkInDate } }
      ],
      status: { $in: ['pending', 'confirmed'] }
    });

    const bookedRooms = overlappingBookings.reduce((sum, b) => sum + b.rooms, 0);
    const availableUnits = Math.max(0, room.quantity - bookedRooms);

    res.status(200).json({
      success: true,
      data: {
        roomId: room._id,
        availableUnits,
        isAvailable: availableUnits > 0
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new room
// @route   POST /api/hotels/:hotelId/rooms
// @access  Private (Owner/Admin)
export const createRoom = async (req, res, next) => {
  try {
    req.body.hotel = req.params.hotelId;
    
    const hotel = await Hotel.findById(req.params.hotelId);
    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found' });
    }

    if (hotel.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to add a room to this hotel' });
    }

    const room = await Room.create(req.body);
    res.status(201).json({ success: true, data: room });
  } catch (error) {
    next(error);
  }
};

// @desc    Update room
// @route   PUT /api/rooms/:id
// @access  Private (Owner/Admin)
export const updateRoom = async (req, res, next) => {
  try {
    let room = await Room.findById(req.params.id).populate('hotel');
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    if (room.hotel.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this room' });
    }

    room = await Room.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({ success: true, data: room });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete room
// @route   DELETE /api/rooms/:id
// @access  Private (Owner/Admin)
export const deleteRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id).populate('hotel');
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    if (room.hotel.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this room' });
    }

    await room.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
