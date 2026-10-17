import Booking from '../models/Booking.js';
import Room from '../models/Room.js';
import Hotel from '../models/Hotel.js';
import crypto from 'crypto';

// Helper to auto-complete bookings
const autoCompleteBookings = async (queryContext) => {
  const now = new Date();
  await Booking.updateMany(
    { ...queryContext, status: 'confirmed', checkOut: { $lt: now } },
    { $set: { status: 'completed' } }
  );
};

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
export const createBooking = async (req, res, next) => {
  try {
    const { hotel, room, checkIn, checkOut, guests, rooms, guestDetails, specialRequests } = req.body;

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const now = new Date();
    
    // Dates validation
    if (checkInDate < new Date(now.setHours(0,0,0,0))) {
      return res.status(400).json({ success: false, message: 'Check-in date cannot be in the past' });
    }
    if (checkOutDate <= checkInDate) {
      return res.status(400).json({ success: false, message: 'Check-out must be after check-in' });
    }
    
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    if (nights > 30) {
      return res.status(400).json({ success: false, message: 'Maximum booking duration is 30 nights' });
    }

    const roomDoc = await Room.findById(room);
    if (!roomDoc) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }
    
    const totalGuests = Number(guests.adults) + (Number(guests.children) || 0);
    const maxCapacity = roomDoc.capacity * Number(rooms);
    if (totalGuests > maxCapacity) {
      return res.status(400).json({ success: false, message: `Exceeds max capacity of ${maxCapacity} guests for ${rooms} rooms` });
    }

    // Availability Check
    const overlappingBookings = await Booking.find({
      room: roomDoc._id,
      $or: [
        { checkIn: { $lt: checkOutDate }, checkOut: { $gt: checkInDate } }
      ],
      status: { $in: ['pending', 'confirmed'] }
    });

    const bookedRoomsCount = overlappingBookings.reduce((sum, b) => sum + b.rooms, 0);
    if (roomDoc.quantity - bookedRoomsCount < Number(rooms)) {
      return res.status(400).json({ success: false, message: 'Not enough rooms available for these dates' });
    }

    // Compute Price
    const subtotal = nights * roomDoc.pricePerNight * Number(rooms);
    const taxes = subtotal * 0.12;
    const serviceFee = subtotal * 0.03;
    const totalPrice = subtotal + taxes + serviceFee;

    // Generate Booking Ref
    const bookingRef = 'BMS-' + crypto.randomBytes(3).toString('hex').toUpperCase();

    const booking = await Booking.create({
      user: req.user.id,
      hotel,
      room,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      nights,
      guests,
      rooms,
      priceBreakdown: { subtotal, taxes, serviceFee, total: totalPrice },
      totalPrice,
      status: 'confirmed',
      paymentStatus: 'unpaid',
      guestDetails,
      specialRequests,
      bookingRef
    });

    res.status(201).json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

// @desc    Simulate payment
// @route   POST /api/bookings/:id/pay
// @access  Private
export const payBooking = async (req, res, next) => {
  try {
    const { method, cardNumber } = req.body;
    let booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (booking.paymentStatus === 'paid') {
      return res.status(400).json({ success: false, message: 'Booking is already paid' });
    }

    if (cardNumber && cardNumber.toString() === '4000000000000002') {
      return res.status(402).json({ success: false, message: 'Payment declined' });
    }

    booking.paymentStatus = 'paid';
    booking.paymentMethod = method || 'Credit Card';
    await booking.save();

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's bookings
// @route   GET /api/bookings/my
// @access  Private
export const getMyBookings = async (req, res, next) => {
  try {
    await autoCompleteBookings({ user: req.user.id });
    
    const bookings = await Booking.find({ user: req.user.id })
      .populate('hotel', 'name images address')
      .populate('room', 'name type')
      .sort({ createdAt: -1 });
      
    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bookings (Admin/Manager)
// @route   GET /api/bookings
// @access  Private (Manager/Admin)
export const getBookings = async (req, res, next) => {
  try {
    const query = {};
    if (req.query.status) {
      query.status = req.query.status;
    }

    if (req.user.role === 'manager') {
      const myHotels = await Hotel.find({ owner: req.user.id }).select('_id');
      const hotelIds = myHotels.map(h => h._id);
      query.hotel = { $in: hotelIds };
    }

    await autoCompleteBookings(query);

    const bookings = await Booking.find(query)
      .populate('hotel', 'name')
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
export const getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('hotel')
      .populate('room')
      .populate('user', 'name email');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Authorization: owner of booking, or manager of hotel, or admin
    if (booking.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      if (req.user.role === 'manager') {
        const hotel = await Hotel.findById(booking.hotel._id);
        if (hotel.owner.toString() !== req.user.id) {
           return res.status(403).json({ success: false, message: 'Not authorized' });
        }
      } else {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }
    }

    if (booking.status === 'confirmed' && new Date(booking.checkOut) < new Date()) {
      booking.status = 'completed';
      await booking.save();
    }

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

// @desc    Update booking (dates, guests)
// @route   PUT /api/bookings/:id
// @access  Private
export const updateBooking = async (req, res, next) => {
  try {
    const { checkIn, checkOut, guests, rooms } = req.body;
    let booking = await Booking.findById(req.params.id).populate('room');

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.user.toString() !== req.user.id) return res.status(403).json({ success: false, message: 'Not authorized' });
    if (booking.status !== 'confirmed' && booking.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Cannot modify cancelled or completed bookings' });
    }

    const checkInDate = checkIn ? new Date(checkIn) : booking.checkIn;
    const checkOutDate = checkOut ? new Date(checkOut) : booking.checkOut;
    const now = new Date();

    if (checkInDate < new Date(now.setHours(0,0,0,0))) {
      return res.status(400).json({ success: false, message: 'Check-in date cannot be in the past' });
    }
    if (checkOutDate <= checkInDate) {
      return res.status(400).json({ success: false, message: 'Check-out must be after check-in' });
    }

    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    if (nights > 30) return res.status(400).json({ success: false, message: 'Max 30 nights' });

    const numRooms = rooms || booking.rooms;
    const totalGuests = (guests?.adults || booking.guests.adults) + (guests?.children || booking.guests.children || 0);
    const maxCapacity = booking.room.capacity * numRooms;
    
    if (totalGuests > maxCapacity) {
      return res.status(400).json({ success: false, message: 'Exceeds max capacity' });
    }

    // Availability Check (exclude current booking)
    const overlappingBookings = await Booking.find({
      room: booking.room._id,
      _id: { $ne: booking._id },
      $or: [
        { checkIn: { $lt: checkOutDate }, checkOut: { $gt: checkInDate } }
      ],
      status: { $in: ['pending', 'confirmed'] }
    });

    const bookedRoomsCount = overlappingBookings.reduce((sum, b) => sum + b.rooms, 0);
    if (booking.room.quantity - bookedRoomsCount < numRooms) {
      return res.status(400).json({ success: false, message: 'Not enough rooms available for the new dates' });
    }

    // Re-price
    const subtotal = nights * booking.room.pricePerNight * numRooms;
    const taxes = subtotal * 0.12;
    const serviceFee = subtotal * 0.03;
    const totalPrice = subtotal + taxes + serviceFee;

    booking.checkIn = checkInDate;
    booking.checkOut = checkOutDate;
    booking.nights = nights;
    if (guests) booking.guests = guests;
    booking.rooms = numRooms;
    booking.priceBreakdown = { subtotal, taxes, serviceFee, total: totalPrice };
    booking.totalPrice = totalPrice;

    await booking.save();
    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel booking
// @route   PATCH /api/bookings/:id/cancel
// @access  Private
export const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('hotel');
    
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (booking.status === 'cancelled' || booking.status === 'completed') {
      return res.status(400).json({ success: false, message: `Booking already ${booking.status}` });
    }

    const checkInDate = new Date(booking.checkIn);
    const hoursUntilCheckIn = (checkInDate - new Date()) / (1000 * 60 * 60);
    const policy = booking.hotel.policies?.cancellation || 'moderate';

    let refundPercent = 0;
    if (policy === 'free') {
      if (hoursUntilCheckIn > 48) refundPercent = 1;
    } else if (policy === 'moderate') {
      if (hoursUntilCheckIn > 24) refundPercent = 0.5;
    } else if (policy === 'strict') {
      refundPercent = 0;
    }

    let refundAmount = 0;
    if (booking.paymentStatus === 'paid') {
      refundAmount = booking.totalPrice * refundPercent;
      booking.paymentStatus = refundAmount > 0 ? 'refunded' : 'paid'; // Wait, if 0 refund, it remains paid or what? The prompt says "set paymentStatus=refunded when applicable".
      if (refundAmount > 0) booking.paymentStatus = 'refunded';
    }

    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking cancelled',
      refundAmount,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update booking status (Manager/Admin)
// @route   PATCH /api/bookings/:id/status
// @access  Private (Manager/Admin)
export const updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    let booking = await Booking.findById(req.params.id).populate('hotel');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    if (req.user.role === 'manager') {
      if (booking.hotel.owner.toString() !== req.user.id) {
         return res.status(403).json({ success: false, message: 'Not authorized' });
      }
    }

    booking.status = status;
    await booking.save();
    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};
