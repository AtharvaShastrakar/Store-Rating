require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
require('./models'); // load all models + associations

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/stores', require('./routes/stores'));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;

sequelize
  .sync({ alter: true })
  .then(async () => {
    console.log('Database synced');

    // Seed admin if not exists
    const { User } = require('./models');
    const bcrypt = require('bcryptjs');
    const adminExists = await User.findOne({ where: { role: 'admin' } });
    if (!adminExists) {
      await User.create({
        name: 'System Administrator User',
        email: 'admin@storerating.com',
        password: 'Admin@123',
        address: 'Platform Admin Office, Main Street',
        role: 'admin',
      });
      console.log('Default admin created: admin@storerating.com / Admin@123');
    }

    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('Failed to connect to database:', err);
    process.exit(1);
  });
