import User from '../models/User.js';

// @desc    Get current user profile
// @route   GET /api/users/me
// @access  Private
export const getMyProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('wishlist');
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc    Update current user profile
// @route   PUT /api/users/me
// @access  Private
export const updateMyProfile = async (req, res, next) => {
  try {
    const { name, phone, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone, avatar },
      { new: true, runValidators: true }
    ).populate('wishlist');
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user wishlist
// @route   GET /api/users/wishlist
// @access  Private
export const getWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('wishlist');
    res.status(200).json({ success: true, count: user.wishlist.length, data: user.wishlist });
  } catch (error) {
    next(error);
  }
};

// @desc    Add to wishlist
// @route   POST /api/users/wishlist/:hotelId
// @access  Private
export const addToWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.wishlist.some(hotelId => hotelId.toString() === req.params.hotelId)) {
      user.wishlist.push(req.params.hotelId);
      await user.save();
    }
    const updatedUser = await User.findById(req.user.id).populate('wishlist');
    res.status(200).json({ success: true, data: updatedUser.wishlist });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove from wishlist
// @route   DELETE /api/users/wishlist/:hotelId
// @access  Private
export const removeFromWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    user.wishlist = user.wishlist.filter(id => id.toString() !== req.params.hotelId);
    await user.save();
    const updatedUser = await User.findById(req.user.id).populate('wishlist');
    res.status(200).json({ success: true, data: updatedUser.wishlist });
  } catch (error) {
    next(error);
  }
};

// === ADMIN ROUTES ===

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin)
export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private (Admin)
export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role/status
// @route   PUT /api/users/:id
// @access  Private (Admin)
export const updateUser = async (req, res, next) => {
  try {
    const { role, isActive } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role, isActive },
      { new: true, runValidators: true }
    );
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin)
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    await user.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
