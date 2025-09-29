const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Instructor = require('../models/Instructor');
const Student = require('../models/Student');

// Register
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }
    user = new User({
      name,
      email,
      password,
      role,
    });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    if (role === 'instructor') {
      const instructor = new Instructor({ user_id: user.id, name });
      await instructor.save();
    } else if (role === 'student') {
      const student = new Student({ user_id: user.id, name });
      await student.save();
    }

    // Fixed payload - include ALL necessary user data inside the user object
    const payload = {
      user: {
        id: user.id,
        name: user.name,        // ← Added name inside user object
        email: user.email,      // ← Added email inside user object
        role: user.role,
        status: user.status
      },
    };
    
    console.log('Register - JWT payload:', payload); // Debug log
    
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: 3600 },
      (err, token) => {
        if (err) throw err;
        res.json({ 
          token,
          user: {                // Also return user data in response
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status
          }
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Login
router.post('/login', async (req, res) => {
  console.log('Login route hit');
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }
    
    // Fixed payload - include ALL necessary user data inside the user object
    const payload = {
      user: {
        id: user.id,
        name: user.name,        // ← Moved name inside user object
        email: user.email,      // ← Added email inside user object
        role: user.role,
        status: user.status
      },
    };
    
    console.log('Login - JWT payload:', payload); // Debug log
    
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: 3600 },
      (err, token) => {
        if (err) throw err;
        res.json({ 
          token,
          user: {                // Also return user data in response
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status
          }
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;