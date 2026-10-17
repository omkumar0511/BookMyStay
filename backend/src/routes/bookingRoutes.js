import express from 'express';
import {
  createBooking,
  payBooking,
  getMyBookings,
  getBookings,
  getBooking,
  updateBooking,
  cancelBooking,
  updateBookingStatus
} from '../controllers/bookingController.js';
import { protect, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // All booking routes require authentication

router
  .route('/')
  .post(createBooking)
  .get(authorizeRoles('manager', 'admin'), getBookings);

router.get('/my', getMyBookings);

router.post('/:id/pay', payBooking);
router.patch('/:id/cancel', cancelBooking);
router.patch('/:id/status', authorizeRoles('manager', 'admin'), updateBookingStatus);

router
  .route('/:id')
  .get(getBooking)
  .put(updateBooking);

export default router;
