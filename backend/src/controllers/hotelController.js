import Hotel from '../models/Hotel.js';
import Room from '../models/Room.js';
import Booking from '../models/Booking.js';
import Review from '../models/Review.js';

// @desc    Get all hotels
// @route   GET /api/hotels
// @access  Public
export const getHotels = async (req, res, next) => {
  try {
    const {
      city, q, checkIn, checkOut, guests, minPrice, maxPrice,
      minRating, propertyType, amenities, featured, sort, page = 1, limit = 10
    } = req.query;

    const query = { status: 'approved' };

    if (city) {
      query['address.city'] = new RegExp(city, 'i');
    }
    if (q) {
      query.$text = { $search: q };
    }
    if (minPrice || maxPrice) {
      query.priceFrom = {};
      if (minPrice) query.priceFrom.$gte = Number(minPrice);
      if (maxPrice) query.priceFrom.$lte = Number(maxPrice);
    }
    if (minRating) {
      query.starRating = { $gte: Number(minRating) };
    }
    if (propertyType) {
      query.propertyType = propertyType;
    }
    if (amenities) {
      const amenitiesList = amenities.split(',').map(a => a.trim());
      query.amenities = { $all: amenitiesList };
    }
    if (featured === 'true') {
      query.featured = true;
    }

    // Availability Filter
    if (checkIn && checkOut) {
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);

      // Find overlapping bookings
      const overlappingBookings = await Booking.find({
        $or: [
          { checkIn: { $lt: checkOutDate }, checkOut: { $gt: checkInDate } }
        ],
        status: { $in: ['pending', 'confirmed'] }
      });

      const bookedRoomCounts = {};
      for (const b of overlappingBookings) {
        const roomId = b.room.toString();
        bookedRoomCounts[roomId] = (bookedRoomCounts[roomId] || 0) + b.rooms;
      }

      const roomQuery = { isAvailable: true };
      if (guests) {
        roomQuery.capacity = { $gte: parseInt(guests) };
      }

      const allRooms = await Room.find(roomQuery);
      const availableRooms = allRooms.filter(r => {
        const booked = bookedRoomCounts[r._id.toString()] || 0;
        return (r.quantity - booked) > 0;
      });

      const availableHotelIds = availableRooms.map(r => r.hotel.toString());
      query._id = { $in: availableHotelIds };
    }

    // Sorting
    let sortObj = {};
    if (sort === 'priceAsc') {
      sortObj = { priceFrom: 1 };
    } else if (sort === 'priceDesc') {
      sortObj = { priceFrom: -1 };
    } else if (sort === 'ratingDesc') {
      sortObj = { starRating: -1, avgRating: -1 };
    } else {
      // recommended
      sortObj = { featured: -1, avgRating: -1 };
    }
    if (q) {
       // if text search, prioritize text score
       sortObj = { score: { $meta: 'textScore' }, ...sortObj };
    }

    const startIndex = (Number(page) - 1) * Number(limit);
    const total = await Hotel.countDocuments(query);
    const pages = Math.ceil(total / Number(limit));

    const hotels = await Hotel.find(query, q ? { score: { $meta: 'textScore' } } : {})
      .sort(sortObj)
      .skip(startIndex)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      data: hotels,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get hotels owned by the current manager
// @route   GET /api/hotels/mine
// @access  Private (Manager)
export const getMyHotels = async (req, res, next) => {
  try {
    const hotels = await Hotel.find({ owner: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: hotels });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all hotels for the admin dashboard
// @route   GET /api/hotels/admin
// @access  Private (Admin)
export const getAdminHotels = async (req, res, next) => {
  try {
    const hotels = await Hotel.find()
      .populate('owner', 'name email')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: hotels.length, data: hotels });
  } catch (error) {
    next(error);
  }
};

// @desc    Get featured hotels
// @route   GET /api/hotels/featured
// @access  Public
export const getFeaturedHotels = async (req, res, next) => {
  try {
    const hotels = await Hotel.find({ status: 'approved', featured: true }).limit(5);
    res.status(200).json({ success: true, data: hotels });
  } catch (error) {
    next(error);
  }
};

// @desc    Get popular cities
// @route   GET /api/hotels/cities
// @access  Public
export const getPopularCities = async (req, res, next) => {
  try {
    const cities = await Hotel.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: '$address.city', count: { $sum: 1 }, image: { $first: { $arrayElemAt: ['$images', 0] } } } },
      { $sort: { count: -1 } },
      { $limit: 6 }
    ]);
    res.status(200).json({ success: true, data: cities });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single hotel with rooms and review summary
// @route   GET /api/hotels/:id
// @access  Public
export const getHotel = async (req, res, next) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found' });
    }

    const rooms = await Room.find({ hotel: hotel._id, isAvailable: true });
    const reviews = await Review.find({ hotel: hotel._id });

    // Calculate rating distribution
    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach(r => {
      ratingDistribution[r.rating] = (ratingDistribution[r.rating] || 0) + 1;
    });

    res.status(200).json({
      success: true,
      data: {
        ...hotel.toObject(),
        rooms,
        reviewSummary: {
          total: reviews.length,
          avgRating: hotel.avgRating,
          distribution: ratingDistribution
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new hotel
// @route   POST /api/hotels
// @access  Private (Manager/Admin)
export const createHotel = async (req, res, next) => {
  try {
    req.body.owner = req.user.id;
    // Admins don't bypass pending automatically unless we specify, but let's just make it pending
    req.body.status = 'pending';
    
    if (req.user.role === 'admin') {
      req.body.status = 'approved';
    }

    const hotel = await Hotel.create(req.body);
    res.status(201).json({ success: true, data: hotel });
  } catch (error) {
    next(error);
  }
};

// @desc    Update hotel
// @route   PUT /api/hotels/:id
// @access  Private (Owner/Admin)
export const updateHotel = async (req, res, next) => {
  try {
    let hotel = await Hotel.findById(req.params.id);
    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found' });
    }

    if (hotel.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this hotel' });
    }

    const updates = { ...req.body };
    delete updates.owner;
    delete updates.status;
    delete updates.slug;
    if (updates.name) {
      updates.slug = updates.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
    }

    hotel = await Hotel.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({ success: true, data: hotel });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete hotel
// @route   DELETE /api/hotels/:id
// @access  Private (Owner/Admin)
export const deleteHotel = async (req, res, next) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found' });
    }

    if (hotel.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this hotel' });
    }

    await hotel.deleteOne();
    // Also delete rooms, bookings, reviews associated with it
    await Room.deleteMany({ hotel: hotel._id });
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

// @desc    Update hotel status
// @route   PATCH /api/hotels/:id/status
// @access  Private (Admin)
export const updateHotelStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const hotel = await Hotel.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found' });
    }
    res.status(200).json({ success: true, data: hotel });
  } catch (error) {
    next(error);
  }
};
