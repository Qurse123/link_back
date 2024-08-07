const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models'); // Adjust the path as per your project structure
const auth = require('../middleware/auth'); // Middleware for protected routes

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ msg: "Passwords don't match" });
    }

    let user = await User.findOne({ where: { email } });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = await User.create({
      email,
      password: hashedPassword
    });

    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    let user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get user details
router.get('/user', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, { attributes: ['email'] });
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
