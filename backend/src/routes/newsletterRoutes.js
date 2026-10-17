import express from 'express';
import rateLimit from 'express-rate-limit';
import { body } from 'express-validator';
import { subscribeToNewsletter } from '../controllers/newsletterController.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();
const subscriptionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

router.post(
  '/',
  subscriptionLimiter,
  body('email').trim().isEmail().withMessage('Please provide a valid email address').normalizeEmail(),
  validate,
  subscribeToNewsletter
);

export default router;
