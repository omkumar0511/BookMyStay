import express from 'express';
import { 
  register, 
  login, 
  logout, 
  getMe, 
  updatePassword, 
  forgotPassword, 
  resetPassword,
  refreshToken 
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { check } from 'express-validator';
import { validate } from '../middleware/validate.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many requests from this IP, please try again after 15 minutes',
});

router.post(
  '/register',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
  ],
  validate,
  register
);

router.post(
  '/login',
  authLimiter,
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
  ],
  validate,
  login
);

router.get('/logout', logout);
router.get('/me', protect, getMe);
router.put('/update-password', protect, updatePassword);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.post('/refresh', refreshToken);

export default router;
