import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true
    },
    tags: {
      type: [String],
      default: [],
      index: true
    },
    date: {
      type: Date,
      required: true,
      index: true
    },
    location: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    price: {
      type: Number,
      required: true,
      min: 0,
      index: true
    },
    totalSeats: {
      type: Number,
      required: true,
      min: 1
    },
    availableSeats: {
      type: Number,
      required: true,
      min: 0,
      index: true
    },
    image: {
      url: {
        type: String,
        default: ''
      },
      publicId: {
        type: String,
        default: ''
      }
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true
    },
    views: {
      type: Number,
      default: 0,
      index: true
    },
    bookingsCount: {
      type: Number,
      default: 0,
      index: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    }
  },
  { timestamps: true }
);

eventSchema.index({ title: 'text', description: 'text', category: 'text', tags: 'text', location: 'text' });
eventSchema.index({ isFeatured: 1, date: 1 });
eventSchema.index({ category: 1, date: 1, price: 1 });

export const Event = mongoose.model('Event', eventSchema);
