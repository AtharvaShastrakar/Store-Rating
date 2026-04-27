const { body, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { User, Store, Rating } = require('../models');
const sequelize = require('../config/database');

exports.getDashboard = async (req, res) => {
  try {
    const [totalUsers, totalStores, totalRatings] = await Promise.all([
      User.count({ where: { role: ['user', 'store_owner'] } }),
      Store.count(),
      Rating.count(),
    ]);
    res.json({ totalUsers, totalStores, totalRatings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createUserValidation = [
  body('name').isLength({ min: 20, max: 60 }).withMessage('Name must be 20–60 characters'),
  body('email').isEmail().withMessage('Invalid email'),
  body('address').isLength({ max: 400 }).withMessage('Address max 400 characters'),
  body('password')
    .isLength({ min: 8, max: 16 })
    .withMessage('Password must be 8–16 characters')
    .matches(/[A-Z]/)
    .withMessage('Must include uppercase letter')
    .matches(/[!@#$%^&*(),.?":{}|<>]/)
    .withMessage('Must include special character'),
  body('role').isIn(['admin', 'user', 'store_owner']).withMessage('Invalid role'),
];

exports.createUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { name, email, address, password, role } = req.body;
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(409).json({ message: 'Email already in use' });

    const user = await User.create({ name, email, address, password, role });
    res.status(201).json({
      user: { id: user.id, name: user.name, email: user.email, address: user.address, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const { name, email, address, role, sortBy = 'name', sortOrder = 'ASC' } = req.query;
    const where = { role: { [Op.ne]: 'admin' } };
    if (name) where.name = { [Op.iLike]: `%${name}%` };
    if (email) where.email = { [Op.iLike]: `%${email}%` };
    if (address) where.address = { [Op.iLike]: `%${address}%` };
    if (role) where.role = role;

    const validSort = ['name', 'email', 'address', 'role'].includes(sortBy) ? sortBy : 'name';
    const validOrder = ['ASC', 'DESC'].includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'ASC';

    const users = await User.findAll({
      where,
      attributes: ['id', 'name', 'email', 'address', 'role'],
      order: [[validSort, validOrder]],
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: ['id', 'name', 'email', 'address', 'role'],
      include: [
        {
          model: Store,
          as: 'store',
          attributes: ['id', 'name'],
          include: [
            {
              model: Rating,
              as: 'ratings',
              attributes: [],
            },
          ],
        },
      ],
    });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const result = user.toJSON();
    if (user.role === 'store_owner' && user.store) {
      const avgRating = await Rating.findOne({
        where: { storeId: user.store.id },
        attributes: [[sequelize.fn('AVG', sequelize.col('rating')), 'avgRating']],
        raw: true,
      });
      result.storeRating = avgRating?.avgRating ? parseFloat(avgRating.avgRating).toFixed(1) : null;
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createStore = async (req, res) => {
  try {
    const { name, email, address, ownerId } = req.body;
    if (!name || name.length < 20 || name.length > 60)
      return res.status(400).json({ message: 'Store name must be 20–60 characters' });

    const existing = await Store.findOne({ where: { email } });
    if (existing) return res.status(409).json({ message: 'Store email already in use' });

    const store = await Store.create({ name, email, address, ownerId: ownerId || null });
    res.status(201).json(store);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getStores = async (req, res) => {
  try {
    const { name, email, address, sortBy = 'name', sortOrder = 'ASC' } = req.query;
    const where = {};
    if (name) where.name = { [Op.iLike]: `%${name}%` };
    if (email) where.email = { [Op.iLike]: `%${email}%` };
    if (address) where.address = { [Op.iLike]: `%${address}%` };

    const validSort = ['name', 'email', 'address'].includes(sortBy) ? sortBy : 'name';
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
    res.json(stores);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
