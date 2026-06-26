import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema(
  {
    seat: {
      type: String,
      required: true
    },
    ticketCode: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    qrCode: {
      type: String,
      required: true
    },
    validationStatus: {
      type: String,
      enum: ['valid', 'used', 'cancelled'],
      default: 'valid'
    },
    validatedAt: {
      type: Date,
      default: null
    }
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true
    },
    seats: {
      type: [String],
      required: true
    },
    qrCode: {
      type: String,
      required: true
    },
    tickets: {
      type: [ticketSchema],
      default: []
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },
    orderId: {
      type: String,
      default: '',
      index: true
    },
    paymentId: {
      type: String,
      default: '',
      index: true
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'paid',
      index: true
    },
    reminderSentAt: {
      type: Date,
      default: null,
      index: true
    },
    bookingStatus: {
      type: String,
      enum: ['confirmed', 'cancelled'],
      default: 'confirmed',
      index: true
    }
  },
  { timestamps: true }
);

bookingSchema.index({ userId: 1, createdAt: -1 });
bookingSchema.index({ eventId: 1, bookingStatus: 1 });

export const Booking = mongoose.model('Booking', bookingSchema);
