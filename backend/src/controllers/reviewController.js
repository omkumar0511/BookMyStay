import Review from '../models/Review.js';
import Hotel from '../models/Hotel.js';
import Booking from '../models/Booking.js';

// Helper to recalculate avgRating and reviewCount
const recalculateHotelRating = async (hotelId) => {
  const stats = await Review.aggregate([
    { $match: { hotel: hotelId } },
    { $group: { _id: '$hotel', avgRating: { $avg: '$rating' }, reviewCount: { $sum: 1 } } }
  ]);

  if (stats.length > 0) {
    await Hotel.findByIdAndUpdate(hotelId, {
      avgRating: Math.round(stats[0].avgRating * 10) / 10,
      reviewCount: stats[0].reviewCount
    });
  } else {
    await Hotel.findByIdAndUpdate(hotelId, { avgRating: 0, reviewCount: 0 });
  }
};

// @desc    Get reviews for a hotel
// @route   GET /api/hotels/:hotelId/reviews
// @access  Public
export const getReviews = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const query = { hotel: req.params.hotelId };
    
    const total = await Review.countDocuments(query);
    const reviews = await Review.find(query)
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: reviews,
      pagination: {
        page, limit, total, pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create review
// @route   POST /api/reviews
// @access  Private
export const createReview = async (req, res, next) => {
  try {
    const { hotel, booking, rating, title, comment } = req.body;

    const bookingDoc = await Booking.findById(booking);
    if (!bookingDoc) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    if (bookingDoc.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (bookingDoc.hotel.toString() !== hotel.toString()) {
      return res.status(400).json({ success: false, message: 'Booking does not belong to this hotel' });
    }
    if (bookingDoc.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'You can only review completed bookings' });
    }

    const alreadyReviewed = await Review.findOne({ user: req.user.id, booking });
    if (alreadyReviewed) {
      return res.status(400).json({ success: false, message: 'Already reviewed this booking' });
    }

    const review = await Review.create({
      user: req.user.id,
      hotel,
      booking,
      rating,
      title,
      comment
    });

    await recalculateHotelRating(hotel);

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
};

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
export const updateReview = async (req, res, next) => {
  try {
    let review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    
    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    review = await Review.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    await recalculateHotelRating(review.hotel);

    res.status(200).json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
export const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const hotelId = review.hotel;
    await review.deleteOne();
    await recalculateHotelRating(hotelId);

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
