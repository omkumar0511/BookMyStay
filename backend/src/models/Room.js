import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema(
  {
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    roomNumber: {
      type: String,
      required: [true, 'Please add a room number'],
    },
    type: {
      type: String,
      enum: ['single', 'double', 'deluxe', 'suite', 'dorm'],
      required: [true, 'Please add a room type'],
    },
    pricePerNight: {
      type: Number,
      required: [true, 'Please add a price per night'],
    },
    capacity: {
      type: Number,
      required: [true, 'Please add capacity (max guests)'],
    },
    beds: {
      type: Number,
      required: [true, 'Please add number of beds'],
    },
    size: {
      type: Number, // in square meters or sq ft
    },
    amenities: {
      type: [String],
    },
    images: {
      type: [String],
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    description: {
      type: String,
    },
    quantity: {
      type: Number,
      default: 1,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

roomSchema.index({ hotel: 1, roomNumber: 1 }, { unique: true });

const Room = mongoose.model('Room', roomSchema);
export default Room;
