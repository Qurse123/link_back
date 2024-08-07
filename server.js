const express = require('express');
require('dotenv').config();
const { sequelize, User } = require('./models');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 1000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

sequelize.sync({ alter: true })
  .then(() => {
    console.log('Database & tables synced');
  })
  .catch(err => console.error('Error syncing database:', err));

sequelize.authenticate()
  .then(() => console.log('Connected to SQLite database'))
  .catch(err => console.error('SQLite database connection error:', err));

// Import routes
const authRoutes = require('./routes/auth');
const apolloRoutes = require('./routes/apollo');
const stripeRoutes = require('./routes/stripe'); // Ensure this line is added

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/apollo', apolloRoutes);
app.use('/api/stripe', stripeRoutes); // Ensure this line is added

// Temporary route to create a test user
app.post('/create-test-user', async (req, res) => {
  try {
    const { uuid, fingerprint, emailCount, isPaidUser } = req.body;
    const user = await User.create({ uuid, fingerprint, emailCount, isPaidUser });
    res.status(201).json(user);
  } catch (error) {
    console.error('Error creating test user:', error);
    res.status(500).json({ error: 'Error creating test user' });
  }
});

// Basic route to render index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/success', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'success.html'));
});


// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start the server
const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log('Unhandled Rejection:', err.message);
  // Close server & exit process
  server.close(() => process.exit(1));
});
