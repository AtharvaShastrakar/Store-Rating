const { Op } = require('sequelize');
const { Store, Rating, User } = require('../models');
const sequelize = require('../config/database');

exports.getStores = async (req, res) => {
  try {
    const { name, address, sortBy = 'name', sortOrder = 'ASC' } = req.query;
    const where = {};
    if (name) where.name = { [Op.iLike]: `%${name}%` };
    if (address) where.address = { [Op.iLike]: `%${address}%` };

    const validSort = ['name', 'address'].includes(sortBy) ? sortBy : 'name';
    const validOrder = ['ASC', 'DESC'].includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'ASC';

    const stores = await Store.findAll({
      where,
      attributes: [
        'id', 'name', 'email', 'address',
        [sequelize.fn('AVG', sequelize.col('ratings.rating')), 'avgRating'],
      ],
      include: [{ model: Rating, as: 'ratings', attributes: [] }],
      group: ['Store.id'],
      order: [[validSort, validOrder]],
    });

    // Attach current user's rating for each store
    const storeIds = stores.map((s) => s.id);
    const userRatings = await Rating.findAll({
      where: { userId: req.user.id, storeId: { [Op.in]: storeIds } },
    });
    const ratingMap = {};
    userRatings.forEach((r) => { ratingMap[r.storeId] = r.rating; });

    const result = stores.map((s) => ({
      ...s.toJSON(),
      userRating: ratingMap[s.id] || null,
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

    const store = await Store.findByPk(storeId);
    if (!store) return res.status(404).json({ message: 'Store not found' });

    const [ratingRecord, created] = await Rating.upsert(
      { userId: req.user.id, storeId, rating },
      { returning: true }
    );

    res.status(created ? 201 : 200).json({
      message: created ? 'Rating submitted' : 'Rating updated',
      rating: ratingRecord,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
