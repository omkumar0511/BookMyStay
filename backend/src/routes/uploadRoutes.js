import express from 'express';
import upload from '../middleware/upload.js';
import { protect, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// POST /api/upload
// Allows multiple images under the field 'images'
router.post('/', protect, authorizeRoles('manager', 'admin'), upload.array('images', 10), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ success: false, message: 'Please upload at least one image' });
  }

  const filePaths = req.files.map(file => `/${file.path.replace(/\\/g, '/')}`);

  res.status(200).json({
    success: true,
    message: 'Images uploaded successfully',
    data: filePaths,
  });
});

export default router;
