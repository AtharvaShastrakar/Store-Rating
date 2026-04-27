const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const { User, Store, Rating } = require('../models');

const buildFilter = (value) => ({ $regex: value, $options: 'i' });

exports.getDashboard = async (req, res) => {
  try {
    const [totalUsers, totalStores, totalRatings] = await Promise.all([
      User.countDocuments({ role: { $in: ['user', 'store_owner'] } }),
      Store.countDocuments(),
      Rating.countDocuments(),
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
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: 'Email already in use' });

    const user = await User.create({ name, email, address, password, role });
    res.status(201).json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const { name, email, address, role, sortBy = 'name', sortOrder = 'ASC' } = req.query;
    const filter = { role: { $ne: 'admin' } };
    if (name) filter.name = buildFilter(name);
    if (email) filter.email = buildFilter(email);
    if (address) filter.address = buildFilter(address);
    if (role) filter.role = role;

    const validSort = ['name', 'email', 'address', 'role'].includes(sortBy) ? sortBy : 'name';
    const validOrder = sortOrder.toUpperCase() === 'DESC' ? -1 : 1;

    const users = await User.find(filter, 'name email address role').sort({ [validSort]: validOrder }).lean();
    res.json(users.map((user) => ({ id: user._id.toString(), ...user })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const user = await User.findById(req.params.id).lean();
    if (!user) return res.status(404).json({ message: 'User not found' });

    const result = { id: user._id.toString(), ...user };
    if (user.role === 'store_owner') {
      const store = await Store.findOne({ ownerId: user._id }).lean();
      if (store) {
        const avgRatingResult = await Rating.aggregate([
          { $match: { storeId: store._id } },
          { $group: { _id: null, avgRating: { $avg: '$rating' } } },
        ]);
        result.store = { id: store._id.toString(), name: store.name };
        result.storeRating = avgRatingResult.length
          ? Number(avgRatingResult[0].avgRating.toFixed(1))
          : null;
      }
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

    const existing = await Store.findOne({ email });
    if (existing) return res.status(409).json({ message: 'Store email already in use' });

    const storeData = { name, email, address };
    if (ownerId) {
      if (!mongoose.Types.ObjectId.isValid(ownerId)) {
        return res.status(400).json({ message: 'Invalid owner ID' });
      }
      storeData.ownerId = ownerId;
    }

    const store = await Store.create(storeData);
    res.status(201).json({
      id: store._id.toString(),
      name: store.name,
      email: store.email,
      address: store.address,
      ownerId: store.ownerId,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getStores = async (req, res) => {
  try {
    const { name, email, address, sortBy = 'name', sortOrder = 'ASC' } = req.query;
    const match = {};
    if (name) match.name = buildFilter(name);
    if (email) match.email = buildFilter(email);
    if (address) match.address = buildFilter(address);

    const validSort = ['name', 'email', 'address'].includes(sortBy) ? sortBy : 'name';
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
      { $project: { ratings: 0 } },
      { $sort: { [validSort]: sortDirection } },
    ]);

    res.json(
      stores.map((store) => ({
        id: store._id.toString(),
        name: store.name,
        email: store.email,
        address: store.address,
        avgRating: store.avgRating != null ? Number(store.avgRating.toFixed(1)) : null,
        createdAt: store.createdAt,
        updatedAt: store.updatedAt,
      }))
    );
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
