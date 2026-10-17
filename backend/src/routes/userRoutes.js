import express from 'express';
import {
  getMyProfile,
  updateMyProfile,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  getUsers,
  getUser,
  updateUser,
  deleteUser
} from '../controllers/userController.js';
import { protect, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // All user routes require authentication

router
  .route('/me')
  .get(getMyProfile)
  .put(updateMyProfile);

router.get('/wishlist', getWishlist);
router.post('/wishlist/:hotelId', addToWishlist);
router.delete('/wishlist/:hotelId', removeFromWishlist);

// Admin Routes
router.use(authorizeRoles('admin'));

router
  .route('/')
  .get(getUsers);

router
  .route('/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);

export default router;
