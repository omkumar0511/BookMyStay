import User from '../models/User.js';
import Hotel from '../models/Hotel.js';
import Booking from '../models/Booking.js';
import Room from '../models/Room.js';

// @desc    Get admin stats
// @route   GET /api/stats/admin
// @access  Private (Admin)
export const getAdminStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalHotels = await Hotel.countDocuments();
    const totalBookings = await Booking.countDocuments();
    
    // Total Revenue (only paid bookings)
    const revenueAgg = await Booking.aggregate([
      { $match: { paymentStatus: 'paid', status: { $in: ['confirmed', 'completed'] } } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' } } }
    ]);
    const revenue = revenueAgg.length > 0 ? revenueAgg[0].totalRevenue : 0;

    // Bookings per month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const bookingsPerMonth = await Booking.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
          count: { $sum: 1 },
          revenue: { 
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, '$totalPrice', 0] } 
          }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Top 5 Cities
    const topCities = await Hotel.aggregate([
      { $group: { _id: '$address.city', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Status Breakdown (Bookings)
    const statusBreakdown = await Booking.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totals: {
          users: totalUsers,
          hotels: totalHotels,
          bookings: totalBookings,
          revenue
        },
        bookingsPerMonth,
        topCities,
        statusBreakdown
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get manager stats
// @route   GET /api/stats/manager
// @access  Private (Manager)
export const getManagerStats = async (req, res, next) => {
  try {
    const myHotels = await Hotel.find({ owner: req.user.id });
    const hotelIds = myHotels.map(h => h._id);

    const totalHotels = hotelIds.length;
    const totalBookings = await Booking.countDocuments({ hotel: { $in: hotelIds } });

    // Revenue
    const revenueAgg = await Booking.aggregate([
      { $match: { hotel: { $in: hotelIds }, paymentStatus: 'paid', status: { $in: ['confirmed', 'completed'] } } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' } } }
    ]);
    const revenue = revenueAgg.length > 0 ? revenueAgg[0].totalRevenue : 0;

    const [roomInventory] = await Room.aggregate([
      { $match: { hotel: { $in: hotelIds }, isAvailable: true } },
      { $group: { _id: null, totalRooms: { $sum: '$quantity' } } }
    ]);

    const periodStart = new Date();
    periodStart.setHours(0, 0, 0, 0);
    const previousPeriodStart = new Date(periodStart);
    previousPeriodStart.setDate(previousPeriodStart.getDate() - 30);
    const periodEnd = new Date(periodStart);
    periodEnd.setDate(periodEnd.getDate() + 30);
    const occupancyBookings = await Booking.find({
      hotel: { $in: hotelIds },
      checkIn: { $lt: periodEnd },
      checkOut: { $gt: previousPeriodStart },
      status: { $in: ['pending', 'confirmed', 'completed'] }
    }).select('checkIn checkOut rooms status');

    const totalRooms = roomInventory?.totalRooms || 0;
    const availableRoomNights = totalRooms * 30;
    const calculateOccupancy = (start, end, statuses) => {
      if (!availableRoomNights) return 0;

      const bookedRoomNights = occupancyBookings.reduce((sum, booking) => {
        if (!statuses.includes(booking.status)) return sum;

        const checkIn = new Date(booking.checkIn);
        const checkOut = new Date(booking.checkOut);
        checkIn.setHours(0, 0, 0, 0);
        checkOut.setHours(0, 0, 0, 0);

        const overlapStart = Math.max(checkIn.getTime(), start.getTime());
        const overlapEnd = Math.min(checkOut.getTime(), end.getTime());
        const nights = Math.max(0, Math.round((overlapEnd - overlapStart) / 86400000));
        return sum + nights * booking.rooms;
      }, 0);

      return Math.min(100, Math.round((bookedRoomNights / availableRoomNights) * 1000) / 10);
    };
    const previousOccupancyRate = calculateOccupancy(previousPeriodStart, periodStart, ['confirmed', 'completed']);
    const occupancyRate = calculateOccupancy(periodStart, periodEnd, ['pending', 'confirmed']);
    const occupancyChange = Math.round((occupancyRate - previousOccupancyRate) * 10) / 10;

    // Recent Bookings
    const recentBookings = await Booking.find({ hotel: { $in: hotelIds } })
      .populate('user', 'name email')
      .populate('hotel', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        totals: {
          hotels: totalHotels,
          bookings: totalBookings,
          revenue,
          occupancyRate,
          occupancyChange
        },
        recentBookings
      }
    });
  } catch (error) {
    next(error);
  }
};
