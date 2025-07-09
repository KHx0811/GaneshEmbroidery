import jwt from 'jsonwebtoken';
import config from '../config.js';

const { jwt_secret } = config;

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      status: "error",
      message: "Access token required",
      data: null
    });
  }

  jwt.verify(token, jwt_secret, (err, user) => {
    if (err) {
      return res.status(403).json({
        status: "error",
        message: "Invalid or expired token",
        data: null
      });
    }
    
    req.user = user;
    next();
  });
};

export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    jwt.verify(token, jwt_secret, (err, user) => {
      if (!err) {
        req.user = user;
      }
    });
  }
  
  next();
};
