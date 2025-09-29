const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Authentication middleware
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    // Check if token starts with 'Bearer '
    let token;
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else {
      token = authHeader;
    }

    if (!token) {
      return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from database to ensure they still exist and get latest info
      const user = await User.findById(decoded.user?.id || decoded.id).select('-password');
      
      if (!user) {
        return res.status(401).json({ msg: 'Token is not valid - user not found' });
      }

      // Set user info in req.user with multiple possible formats for compatibility
      req.user = {
        id: user._id.toString(),
        _id: user._id.toString(),
        user: {
          id: user._id.toString(),
          _id: user._id.toString()
        },
        name: user.name,
        email: user.email,
        role: user.role
      };

      next();
    } catch (err) {
      console.error('Token verification error:', err.message);
      return res.status(401).json({ msg: 'Token is not valid' });
    }
  } catch (err) {
    console.error('Authentication middleware error:', err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
};

// Authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ msg: 'No user found in request' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        msg: `Access denied. Required role: ${roles.join(' or ')}, but user has role: ${req.user.role}` 
      });
    }

    next();
  };
};

// Optional authentication middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (authHeader) {
      let token;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      } else {
        token = authHeader;
      }

      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          const user = await User.findById(decoded.user?.id || decoded.id).select('-password');
          
          if (user) {
            req.user = {
              id: user._id.toString(),
              _id: user._id.toString(),
              user: {
                id: user._id.toString(),
                _id: user._id.toString()
              },
              name: user.name,
              email: user.email,
              role: user.role
            };
          }
        } catch (err) {
          // Token invalid, but continue without user
          console.log('Optional auth - invalid token:', err.message);
        }
      }
    }
    
    next();
  } catch (err) {
    console.error('Optional auth middleware error:', err.message);
    next(); // Continue even if there's an error
  }
};

// Middleware to check if user is instructor and owns the resource
const checkInstructorOwnership = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ msg: 'No user found' });
    }

    if (req.user.role !== 'instructor') {
      return res.status(403).json({ msg: 'Access denied. Instructor role required.' });
    }

    // Check if the instructor ID in params matches the authenticated user
    const paramId = req.params.id || req.params.instructorId;
    const userId = req.user.id || req.user._id || (req.user.user && req.user.user.id);

    if (paramId && paramId !== userId) {
      return res.status(403).json({ msg: 'Access denied. You can only access your own data.' });
    }

    next();
  } catch (err) {
    console.error('Instructor ownership check error:', err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
};

module.exports = {
  authenticate,
  authorize,
  optionalAuth,
  checkInstructorOwnership
};