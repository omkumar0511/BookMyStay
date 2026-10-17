import mongoose from 'mongoose';

const hotelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    propertyType: {
      type: String,
      enum: ['hotel', 'resort', 'hostel', 'villa', 'apartment', 'boutique'],
      required: true,
    },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, required: true },
      zip: { type: String, required: true },
    },
    location: {
      lat: { type: Number },
      lng: { type: Number },
    },
    images: {
      type: [String],
    },
    amenities: {
      type: [String],
    },
    starRating: {
      type: Number,
      min: 1,
      max: 5,
      default: 1,
    },
    avgRating: {
      type: Number,
      default: 0,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    priceFrom: {
      type: Number,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    policies: {
      checkIn: { type: String },
      checkOut: { type: String },
      cancellation: {
        type: String,
        enum: ['free', 'moderate', 'strict'],
        default: 'moderate',
      },
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

hotelSchema.pre('save', function (next) {
  if (!this.isModified('name')) {
    next();
    return;
  }
  this.slug = this.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
  next();
});

// Text index
hotelSchema.index({ name: 'text', 'address.city': 'text', 'address.country': 'text' });
hotelSchema.index({ status: 1 });

const Hotel = mongoose.model('Hotel', hotelSchema);
export default Hotel;
