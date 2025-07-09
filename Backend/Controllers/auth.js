import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import config from '../config.js';
import User from '../Models/user.js';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

dotenv.config();

const { jwt_secret, google_oauth_client_id, google_oauth_client_secret, client_url } = config;

passport.use(new GoogleStrategy({
    clientID: google_oauth_client_id,
    clientSecret: google_oauth_client_secret,
    callbackURL: "/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
            return done(null, user);
        }

        user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
            user.googleId = profile.id;
            await user.save();
            return done(null, user);
        }

        const newUser = new User({
            googleId: profile.id,
            username: profile.displayName || profile.emails[0].value.split('@')[0],
            email: profile.emails[0].value,
            password: null,
            avatar: profile.photos[0]?.value || null
        });

        await newUser.save();
        return done(null, newUser);

    } catch (error) {
        return done(error, null);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});


export const signup = async (req, res) => {
    try {
        const { username, email, password, retypedPassword } = req.body;
        
        if (!username || !email || !password || !retypedPassword) {
            return res.status(400).json({ 
                status: "error",
                message: 'All fields are required',
                data: null 
            });
        }
        
        if (password !== retypedPassword) {
            return res.status(400).json({
                status: "error",
                message: 'Passwords do not match',
                data: null
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                status: "error",
                message: 'Password must be at least 6 characters long',
                data: null
            });
        }

        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            const field = existingUser.email === email ? 'email' : 'username';
            return res.status(409).json({
                status: "error",
                message: `User already exists with this ${field}`,
                data: null
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const newUser = new User({ 
            username, 
            email, 
            password: hashedPassword 
        });
        await newUser.save();

        return res.status(201).json({
            status: "success",
            message: 'User created successfully',
            data: {
                user: {
                    id: newUser._id,
                    username: newUser.username,
                    email: newUser.email
                }
            }
        });
    } catch (error) {
        console.error('Signup error:', error);
        return res.status(500).json({
            status: "error",
            message: "Internal server error",
            data: null,
        });
    }
};


export const login = async (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ 
            status: "error",
            message: 'Username/email and password are required', 
            data: null 
        });
    }
    
    try {
        const isEmail = username.includes('@');
        const user = await User.findOne(
            isEmail ? { email: username } : { username: username }
        );
        
        if (!user) {
            return res.status(404).json({
                status: "error",
                message: 'User not found',
                data: null
            });
        }

        if (!user.password) {
            return res.status(400).json({
                status: "error",
                message: 'This account was created with Google. Please use Google login.',
                data: null
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                status: "error",
                message: 'Invalid password', 
                data: null
            });
        }

        const token = jwt.sign(
            {
                userId: user._id,
                username: user.username,
                email: user.email,
                role: user.role || 'user'
            }, 
            jwt_secret,
            { expiresIn: '24h' }
        );
        
        return res.status(200).json({
            status: "success",
            message: 'Login successful',
            data: {
                token,
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    role: user.role || 'user',
                    avatar: user.avatar
                }
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({
            status: "error",
            message: "Internal server error",
            data: null,
        });
    }
};


export const googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email']
});

export const googleCallback = (req, res, next) => {
  passport.authenticate('google', (err, user, info) => {
    if (err) {
      console.error('Google auth error:', err);
      return res.redirect(`${client_url}/login?error=server_error`);
    }
    
    if (!user) {
      console.log('Google auth failed: no user returned');
      return res.redirect(`${client_url}/login?error=auth_failed`);
    }
    
    try {
      const token = jwt.sign(
        { 
          userId: user._id, 
          username: user.username, 
          email: user.email,
          role: user.role || 'user'
        },
        jwt_secret,
        { expiresIn: '24h' }
      );
      
      return res.redirect(`${client_url}/auth/success?token=${token}`);
      
    } catch (tokenError) {
      console.error('Token generation error:', tokenError);
      return res.redirect(`${client_url}/login?error=server_error`);
    }
    
  })(req, res, next);
};

export const logout = (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return res.status(200).json({
        status: "success",
        message: "Logged out successfully",
        data: null
      });
    }
    
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          console.error('Session destruction error:', err);
          return res.status(500).json({
            status: "error",
            message: "Error logging out",
            data: null
          });
        }
        
        res.clearCookie('connect.sid');
        return res.status(200).json({
          status: "success",
          message: "Logged out successfully",
          data: null
        });
      });
    } else {
      return res.status(200).json({
        status: "success",
        message: "Logged out successfully",
        data: null
      });
    }
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({
      status: "error",
      message: "Error logging out",
      data: null
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
        data: null
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Profile retrieved successfully",
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role || 'user',
          avatar: user.avatar,
          createdAt: user.createdAt
        }
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({
      status: "error",
      message: "Error retrieving profile",
      data: null
    });
  }
};