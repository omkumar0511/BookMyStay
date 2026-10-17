import express from 'express';
import {
  getHotels,
  getMyHotels,
  getAdminHotels,
  getFeaturedHotels,
  getPopularCities,
  getHotel,
  createHotel,
  updateHotel,
  deleteHotel,
  updateHotelStatus,
} from '../controllers/hotelController.js';
import { protect, authorizeRoles } from '../middleware/auth.js';

import roomRouter from './roomRoutes.js';
import reviewRouter from './reviewRoutes.js';

const router = express.Router();

// Re-route into other resource routers
router.use('/:hotelId/rooms', roomRouter);
router.use('/:hotelId/reviews', reviewRouter);

router.get('/featured', getFeaturedHotels);
router.get('/cities', getPopularCities);
router.get('/mine', protect, authorizeRoles('manager', 'admin'), getMyHotels);
router.get('/admin', protect, authorizeRoles('admin'), getAdminHotels);

router
  .route('/')
  .get(getHotels)
  .post(protect, authorizeRoles('manager', 'admin'), createHotel);

router
  .route('/:id')
  .get(getHotel)
  .put(protect, authorizeRoles('manager', 'admin'), updateHotel)
  .delete(protect, authorizeRoles('manager', 'admin'), deleteHotel);

router.patch('/:id/status', protect, authorizeRoles('admin'), updateHotelStatus);

export default router;
