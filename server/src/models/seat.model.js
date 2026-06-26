import mongoose from 'mongoose';

const seatSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true
    },
    label: {
      type: String,
      required: true,
      trim: true
    },
    row: {
      type: String,
      required: true,
      index: true
    },
    number: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['available', 'locked', 'booked'],
      default: 'available',
      index: true
    },
    lockedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    },
    lockExpiresAt: {
      type: Date,
      default: null,
      index: true
    },
    bookedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    bookedAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

seatSchema.index({ event: 1, label: 1 }, { unique: true });
seatSchema.index({ event: 1, status: 1, lockExpiresAt: 1 });

export const Seat = mongoose.model('Seat', seatSchema);
