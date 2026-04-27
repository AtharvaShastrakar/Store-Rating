const mongoose = require('mongoose');
const { Store, Rating } = require('../models');

const buildFilter = (value) => ({ $regex: value, $options: 'i' });

exports.getStores = async (req, res) => {
  try {
    const { name, address, sortBy = 'name', sortOrder = 'ASC' } = req.query;
    const match = {};
    if (name) match.name = buildFilter(name);
    if (address) match.address = buildFilter(address);

    const validSort = ['name', 'address'].includes(sortBy) ? sortBy : 'name';
    const sortDirection = sortOrder.toUpperCase() === 'DESC' ? -1 : 1;

    const stores = await Store.aggregate([
      { $match: match },
      {
        $lookup: {
          from: 'ratings',
          localField: '_id',
          foreignField: 'storeId',
          as: 'ratings',
        },
      },
      {
        $addFields: {
          avgRating: { $avg: '$ratings.rating' },
        },
      },
      {
        $project: {
          ratings: 0,
        },
      },
      { $sort: { [validSort]: sortDirection } },
    ]);

    const storeIds = stores.map((s) => s._id);
    const userRatings = storeIds.length
      ? await Rating.find({ userId: req.user._id, storeId: { $in: storeIds } }).lean()
      : [];

    const ratingMap = {};
    userRatings.forEach((r) => {
      ratingMap[r.storeId.toString()] = r.rating;
    });

    const result = stores.map((store) => ({
      id: store._id.toString(),
      name: store.name,
      email: store.email,
      address: store.address,
      avgRating: store.avgRating != null ? Number(store.avgRating.toFixed(1)) : null,
      userRating: ratingMap[store._id.toString()] || null,
      createdAt: store.createdAt,
      updatedAt: store.updatedAt,
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.submitRating = async (req, res) => {
  try {
    const { storeId, rating } = req.body;
    if (!rating || rating < 1 || rating > 5)
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });

    if (!mongoose.Types.ObjectId.isValid(storeId)) {
      return res.status(400).json({ message: 'Invalid store ID' });
    }

    const store = await Store.findById(storeId);
    if (!store) return res.status(404).json({ message: 'Store not found' });

    const existingRating = await Rating.findOne({ userId: req.user._id, storeId });
    if (existingRating) {
      existingRating.rating = rating;
      await existingRating.save();
      return res.status(200).json({ message: 'Rating updated', rating: existingRating });
    }

    const ratingRecord = await Rating.create({ userId: req.user._id, storeId, rating });
    res.status(201).json({ message: 'Rating submitted', rating: ratingRecord });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
