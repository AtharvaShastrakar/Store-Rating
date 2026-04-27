const { Rating, User, Store } = require('../models');
const sequelize = require('../config/database');

exports.getMyStoreDashboard = async (req, res) => {
  try {
    const store = await Store.findOne({ where: { ownerId: req.user.id } });
    if (!store) return res.status(404).json({ message: 'No store found for this owner' });

    const avgRatingResult = await Rating.findOne({
      where: { storeId: store.id },
      attributes: [[sequelize.fn('AVG', sequelize.col('rating')), 'avgRating']],
      raw: true,
    });

    const ratings = await Rating.findAll({
      where: { storeId: store.id },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json({
      store: { id: store.id, name: store.name, address: store.address },
      avgRating: avgRatingResult?.avgRating ? parseFloat(avgRatingResult.avgRating).toFixed(1) : null,
      ratings: ratings.map((r) => ({
        userId: r.userId,
        userName: r.user.name,
        userEmail: r.user.email,
        rating: r.rating,
        submittedAt: r.updatedAt,
      })),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
