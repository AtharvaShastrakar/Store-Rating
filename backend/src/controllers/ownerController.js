const { Rating, Store } = require('../models');

exports.getMyStoreDashboard = async (req, res) => {
  try {
    const store = await Store.findOne({ ownerId: req.user._id });
    if (!store) return res.status(404).json({ message: 'No store found for this owner' });

    const ratings = await Rating.find({ storeId: store._id })
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    const avgRating = ratings.length
      ? Number((ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1))
      : null;

    res.json({
      store: { id: store._id.toString(), name: store.name, address: store.address },
      avgRating,
      ratings: ratings.map((r) => ({
        userId: r.user?._id?.toString() || null,
        userName: r.user?.name || null,
        userEmail: r.user?.email || null,
        rating: r.rating,
        submittedAt: r.updatedAt,
      })),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
