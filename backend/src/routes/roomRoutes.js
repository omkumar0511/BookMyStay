import express from 'express';
import {
  getRooms,
  getRoomAvailability,
  createRoom,
  updateRoom,
  deleteRoom,
} from '../controllers/roomController.js';
import { protect, authorizeRoles } from '../middleware/auth.js';

// We merge params because this router is used for both:
// /api/rooms/...
// /api/hotels/:hotelId/rooms/...
const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(getRooms)
  .post(protect, authorizeRoles('manager', 'admin'), createRoom);

router.get('/:id/availability', getRoomAvailability);

router
  .route('/:id')
  .put(protect, authorizeRoles('manager', 'admin'), updateRoom)
  .delete(protect, authorizeRoles('manager', 'admin'), deleteRoom);

export default router;
