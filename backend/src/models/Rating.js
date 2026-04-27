const mongoose = require('mongoose');

const { Schema } = mongoose;

const ratingSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    storeId: {
      type: Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
  },
  { timestamps: true }
);

ratingSchema.index({ userId: 1, storeId: 1 }, { unique: true });

module.exports = mongoose.model('Rating', ratingSchema);
