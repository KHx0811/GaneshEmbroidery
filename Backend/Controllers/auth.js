import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import config from '../config.js';
import User from '../Models/user.js';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { sendEmail } from '../Services/emailService.js';

dotenv.config();

const { jwt_secret, google_oauth_client_id, google_oauth_client_secret, client_url, server_url, smtp_user, smtp_pass } = config;

passport.use(new GoogleStrategy({
  clientID: google_oauth_client_id,
  clientSecret: google_oauth_client_secret,
  callbackURL: server_url ? `${server_url}/auth/google/callback` : "/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ googleId: profile.id });

    if (user) {
      return done(null, user);
    }

    user = await User.findOne({ email: profile.emails[0].value });

    if (user) {
      user.googleId = profile.id;
      user.authProvider = 'google';
      user.isVerified = true;
      await user.save();
      return done(null, user);
    }

    const newUser = new User({
      googleId: profile.id,
      username: profile.displayName || profile.emails[0].value.split('@')[0],
      email: profile.emails[0].value,
      password: null,
      avatar: profile.photos[0]?.value || null,
      authProvider: 'google',
      isVerified: true
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

    if (user.enableTwoFactor) {
      return res.status(200).json({
        status: "success",
        message: 'Password verified. 2FA required.',
        data: {
          requires2FA: true,
          email: user.email,
          userId: user._id
        }
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        username: user.username,
        email: user.email,
        role: user.role || 'user',
        isVerified: user.isVerified || false,
        authProvider: user.authProvider || 'local',
        googleId: user.googleId
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

const googleTwoFactorSessions = new Map();

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
      if (user.enableTwoFactor) {
        console.log('User has 2FA enabled, storing session and redirecting to 2FA verification');

        const sessionId = `google_2fa_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        googleTwoFactorSessions.set(sessionId, {
          userId: user._id,
          username: user.username,
          email: user.email,
          role: user.role || 'user',
          avatar: user.avatar,
          googleId: user.googleId,
          expires: Date.now() + 15 * 60 * 1000
        });

        return res.redirect(`${client_url}/login?requires2FA=true&sessionId=${sessionId}&type=google`);
      }

      const token = jwt.sign(
        {
          userId: user._id,
          username: user.username,
          email: user.email,
          role: user.role || 'user',
          isVerified: user.isVerified || true, // Google users are automatically verified
          authProvider: user.authProvider || 'google',
          googleId: user.googleId
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
          isVerified: user.isVerified || false,
          authProvider: user.authProvider || 'local',
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

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        status: 'error',
        message: 'Current password and new password are required'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    if (user.googleId && !user.password) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot change password for Google account'
      });
    }

    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(400).json({
        status: 'error',
        message: 'Current password is incorrect'
      });
    }

    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    user.password = hashedNewPassword;
    await user.save();

    try {
      const mailOptions = {
        to: user.email,
        subject: 'Password Changed Successfully - SL Designers',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #021D3B 0%, #0f2a4a 100%); color: white; border-radius: 10px;">
              <h2 style="margin: 0; color: white;">🔐 Password Changed</h2>
              <p style="margin: 10px 0 0 0; color: #D8B46A;">SL Designers Admin Portal</p>
            </div>
            
            <div style="padding: 30px 20px; background: #f8f9fa; border-radius: 10px; margin: 20px 0;">
              <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
                Hello <strong>${user.username}</strong>,
              </p>
              
              <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; border-left: 4px solid #4caf50; margin: 20px 0;">
                <p style="margin: 0; font-size: 14px; color: #2e7d32;">
                  ✅ <strong>Success:</strong> Your password has been changed successfully.
                </p>
              </div>
              
              <p style="font-size: 14px; color: #333;">
                <strong>When:</strong> ${new Date().toLocaleString('en-IN', {
          timeZone: 'Asia/Kolkata',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}
              </p>
              
              <div style="margin-top: 20px; padding: 15px; background: #ffebee; border-radius: 8px; border-left: 4px solid #f44336;">
                <p style="margin: 0; font-size: 14px; color: #c62828;">
                  🛡️ <strong>Security Notice:</strong> If you didn't make this change, please contact support immediately.
                </p>
              </div>
            </div>
            
            <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
              <p>© 2025 SL Designers. All rights reserved.</p>
            </div>
          </div>
        `
      };

      const result = await sendEmail(mailOptions);
      console.log('✅ Password change notification sent:', result);
    } catch (emailError) {
      console.error('Failed to send password change notification:', emailError);
    }

    res.status(200).json({
      status: 'success',
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

export const send2FAOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const userId = req.user.userId;

    if (!email) {
      return res.status(400).json({
        status: 'error',
        message: 'Email is required'
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.resetOtp = otp;
    user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000;

    await user.save();

    console.log("OTP generated:", otp);
    console.log("Sending email to:", email);

    const mailOptions = {
      to: email,
      subject: 'Enable Two-Factor Authentication - SL Designers',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #021D3B 0%, #0f2a4a 100%); color: white; border-radius: 10px;">
            <h2 style="margin: 0; color: white;">🔐 Two-Factor Authentication Setup</h2>
            <p style="margin: 10px 0 0 0; color: #D8B46A;">SL Designers Admin Portal</p>
          </div>
          
          <div style="padding: 30px 20px; background: #f8f9fa; border-radius: 10px; margin: 20px 0;">
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
              You are setting up Two-Factor Authentication for your SL Designers admin account.
            </p>
            
            <div style="background: white; padding: 25px; border-radius: 8px; text-align: center; border: 2px solid #D8B46A;">
              <h3 style="color: #021D3B; margin: 0 0 10px 0;">Your Verification Code:</h3>
              <div style="font-size: 36px; font-weight: bold; color: #D8B46A; letter-spacing: 8px; font-family: 'Courier New', monospace;">${otp}</div>
            </div>
            
            <div style="margin-top: 20px; padding: 15px; background: #fff3e0; border-radius: 8px; border-left: 4px solid #ff9800;">
              <p style="margin: 0; font-size: 14px; color: #e65100;">
                ⏰ <strong>Important:</strong> This code will expire in 15 minutes.
              </p>
            </div>
            
            <p style="font-size: 14px; color: #666; margin-top: 20px;">
              If you didn't request this setup, please ignore this email and secure your account.
            </p>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
            <p>© 2025 SL Designers. All rights reserved.</p>
          </div>
        </div>
      `
    };

    const result = await sendEmail(mailOptions);

    res.status(200).json({
      status: 'success',
      message: 'OTP sent successfully'
    });
  } catch (error) {
    console.error('Send 2FA OTP error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to send OTP',
      debug: error.message
    });
  }
};

export const verify2FASetup = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const userId = req.user.userId;

    if (!email || !otp) {
      return res.status(400).json({
        status: 'error',
        message: 'Email and OTP are required'
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    if (user.resetOtp !== otp || user.resetOtp === "") {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid OTP'
      });
    }

    if (user.resetOtpExpireAt < Date.now()) {
      return res.status(400).json({
        status: 'error',
        message: 'OTP expired'
      });
    }

    user.enableTwoFactor = true;
    user.twoFactorEmail = email;

    user.resetOtp = "";
    user.resetOtpExpireAt = null;

    await user.save();

    res.status(200).json({
      status: 'success',
      message: '2FA enabled successfully'
    });
  } catch (error) {
    console.error('Verify 2FA setup error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to verify 2FA'
    });
  }
};

export const sendLoginOTP = async (req, res) => {
  try {
    const { email, userId } = req.body;

    let user;
    if (userId) {
      user = await User.findById(userId);
    } else if (email) {
      user = await User.findOne({ email });
    } else {
      return res.status(400).json({
        status: 'error',
        message: 'Email or User ID is required'
      });
    }

    if (!user || !user.enableTwoFactor) {
      return res.status(400).json({
        status: 'error',
        message: 'User not found or 2FA not enabled'
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.resetOtp = otp;
    user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000;

    await user.save();

    const mailOptions = {
      to: user.email,
      subject: 'Login Verification Code - SL Designers',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #021D3B 0%, #0f2a4a 100%); color: white; border-radius: 10px;">
            <h2 style="margin: 0; color: white;">🔑 Login Verification</h2>
            <p style="margin: 10px 0 0 0; color: #D8B46A;">SL Designers Admin Portal</p>
          </div>
          
          <div style="padding: 30px 20px; background: #f8f9fa; border-radius: 10px; margin: 20px 0;">
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
              Please use the following verification code to complete your ${user.googleId ? 'Google' : ''} login:
            </p>
            
            <div style="background: white; padding: 25px; border-radius: 8px; text-align: center; border: 2px solid #D8B46A;">
              <h3 style="color: #021D3B; margin: 0 0 10px 0;">Your Login Code:</h3>
              <div style="font-size: 36px; font-weight: bold; color: #D8B46A; letter-spacing: 8px; font-family: 'Courier New', monospace;">${otp}</div>
            </div>
            
            <div style="margin-top: 20px; padding: 15px; background: #fff3e0; border-radius: 8px; border-left: 4px solid #ff9800;">
              <p style="margin: 0; font-size: 14px; color: #e65100;">
                ⏰ <strong>Important:</strong> This code will expire in 15 minutes.
              </p>
            </div>
            
            <div style="margin-top: 15px; padding: 15px; background: #ffebee; border-radius: 8px; border-left: 4px solid #f44336;">
              <p style="margin: 0; font-size: 14px; color: #c62828;">
                🛡️ <strong>Security Alert:</strong> If you didn't attempt to login, please secure your account immediately.
              </p>
            </div>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
            <p>© 2025 SL Designers. All rights reserved.</p>
          </div>
        </div>
      `
    };

    const result = await sendEmail(mailOptions);
    console.log("✅ Login OTP email sent successfully:", result);

    res.status(200).json({
      status: 'success',
      message: 'Login OTP sent successfully',
      data: { userId: user._id }
    });
  } catch (error) {
    console.error('Send login OTP error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to send login OTP'
    });
  }
};

export const verifyLoginOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({
        status: 'error',
        message: 'User ID and OTP are required'
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    if (user.resetOtp !== otp || user.resetOtp === "") {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid OTP'
      });
    }

    if (user.resetOtpExpireAt < Date.now()) {
      return res.status(400).json({
        status: 'error',
        message: 'OTP has expired'
      });
    }

    user.resetOtp = "";
    user.resetOtpExpireAt = null;
    await user.save();

    const token = jwt.sign(
      {
        userId: user._id,
        username: user.username,
        email: user.email,
        role: user.role || 'user',
        googleId: user.googleId
      },
      jwt_secret,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      status: 'success',
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
    console.error('Verify login OTP error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to verify login OTP'
    });
  }
};

export const sendResetOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.json({ success: false, message: "Enter email" });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));

    user.resetOtp = otp;
    user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000;

    await user.save();

    const mailOptions = {
      to: user.email,
      subject: "Password Reset OTP - SL Designers",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #021D3B 0%, #0f2a4a 100%); color: white; border-radius: 10px;">
            <h2 style="margin: 0; color: white;">🔐 Password Reset</h2>
            <p style="margin: 10px 0 0 0; color: #D8B46A;">SL Designers Admin Portal</p>
          </div>
          
          <div style="padding: 30px 20px; background: #f8f9fa; border-radius: 10px; margin: 20px 0;">
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
              You have requested to reset your password for your SL Designers account.
            </p>
            
            <div style="background: white; padding: 25px; border-radius: 8px; text-align: center; border: 2px solid #D8B46A;">
              <h3 style="color: #021D3B; margin: 0 0 10px 0;">Your Reset Code:</h3>
              <div style="font-size: 36px; font-weight: bold; color: #D8B46A; letter-spacing: 8px; font-family: 'Courier New', monospace;">${otp}</div>
            </div>
            
            <div style="margin-top: 20px; padding: 15px; background: #fff3e0; border-radius: 8px; border-left: 4px solid #ff9800;">
              <p style="margin: 0; font-size: 14px; color: #e65100;">
                ⏰ <strong>Important:</strong> This code will expire in 15 minutes.
              </p>
            </div>
            
            <p style="font-size: 14px; color: #666; margin-top: 20px;">
              If you didn't request this password reset, please ignore this email and your password will remain unchanged.
            </p>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
            <p>© 2025 SL Designers. All rights reserved.</p>
          </div>
        </div>
      `
    };

    const result = await sendEmail(mailOptions);

    return res.json({ success: true, message: "Reset OTP sent successfully" });
  } catch (error) {
    console.error('Send reset OTP error:', error);
    return res.json({ success: false, message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.json({ success: false, message: "Enter all fields" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    if (user.resetOtp !== otp || user.resetOtp === "") {
      return res.json({ success: false, message: "Invalid OTP" });
    }

    if (user.resetOtpExpireAt < Date.now()) {
      return res.json({ success: false, message: "OTP expired" });
    }

    const newHashedPassword = await bcrypt.hash(newPassword, 12);

    user.password = newHashedPassword;
    user.resetOtp = "";
    user.resetOtpExpireAt = null;

    await user.save();

    try {
      const mailOptions = {
        to: user.email,
        subject: 'Password Reset Successful - SL Designers',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #021D3B 0%, #0f2a4a 100%); color: white; border-radius: 10px;">
              <h2 style="margin: 0; color: white;">✅ Password Reset Complete</h2>
              <p style="margin: 10px 0 0 0; color: #D8B46A;">SL Designers Admin Portal</p>
            </div>
            
            <div style="padding: 30px 20px; background: #f8f9fa; border-radius: 10px; margin: 20px 0;">
              <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
                Hello <strong>${user.username}</strong>,
              </p>
              
              <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; border-left: 4px solid #4caf50; margin: 20px 0;">
                <p style="margin: 0; font-size: 14px; color: #2e7d32;">
                  ✅ <strong>Success:</strong> Your password has been reset successfully.
                </p>
              </div>
              
              <p style="font-size: 14px; color: #333;">
                <strong>When:</strong> ${new Date().toLocaleString('en-IN', {
          timeZone: 'Asia/Kolkata',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}
              </p>
              
              <div style="margin-top: 20px; padding: 15px; background: #e3f2fd; border-radius: 8px; border-left: 4px solid #2196f3;">
                <p style="margin: 0; font-size: 14px; color: #1565c0;">
                  🔐 <strong>Next Steps:</strong> You can now login with your new password.
                </p>
              </div>
              
              <div style="margin-top: 15px; padding: 15px; background: #ffebee; border-radius: 8px; border-left: 4px solid #f44336;">
                <p style="margin: 0; font-size: 14px; color: #c62828;">
                  🛡️ <strong>Security Notice:</strong> If you didn't reset your password, please contact support immediately.
                </p>
              </div>
            </div>
            
            <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
              <p>© 2025 SL Designers. All rights reserved.</p>
            </div>
          </div>
        `
      };

      const result = await sendEmail(mailOptions);
    } catch (emailError) {
      console.error('Failed to send password reset confirmation:', emailError);
    }

    return res.json({ success: true, message: "Password has been reset successfully" });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.json({ success: false, message: error.message });
  }
};

export const verifyTokenStatus = async (req, res) => {
  try {
    return res.status(200).json({
      status: "success",
      message: "Token is valid",
      data: {
        userId: req.user.userId,
        role: req.user.role || 'user'
      }
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
      data: null
    });
  }
};

export const sendGoogleLogin2FAOTP = async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        status: 'error',
        message: 'Session ID is required'
      });
    }

    const sessionData = googleTwoFactorSessions.get(sessionId);

    if (!sessionData) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid or expired session'
      });
    }

    if (sessionData.expires < Date.now()) {
      googleTwoFactorSessions.delete(sessionId);
      return res.status(400).json({
        status: 'error',
        message: 'Session expired'
      });
    }

    const user = await User.findById(sessionData.userId);
    if (!user || !user.enableTwoFactor) {
      return res.status(400).json({
        status: 'error',
        message: 'User not found or 2FA not enabled'
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.resetOtp = otp;
    user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000; // 15 minutes

    await user.save();

    const mailOptions = {
      to: user.email,
      subject: 'Google Login Verification Code - SL Designers',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #021D3B 0%, #0f2a4a 100%); color: white; border-radius: 10px;">
            <h2 style="margin: 0; color: white;">🔑 Google Login Verification</h2>
            <p style="margin: 10px 0 0 0; color: #D8B46A;">SL Designers Admin Portal</p>
          </div>
          
          <div style="padding: 30px 20px; background: #f8f9fa; border-radius: 10px; margin: 20px 0;">
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
              Hello <strong>${user.username}</strong>,
            </p>
            
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
              Please use the following verification code to complete your Google login:
            </p>
            
            <div style="background: white; padding: 25px; border-radius: 8px; text-align: center; border: 2px solid #D8B46A;">
              <h3 style="color: #021D3B; margin: 0 0 10px 0;">Your Login Code:</h3>
              <div style="font-size: 36px; font-weight: bold; color: #D8B46A; letter-spacing: 8px; font-family: 'Courier New', monospace;">${otp}</div>
            </div>
            
            <div style="margin-top: 20px; padding: 15px; background: #fff3e0; border-radius: 8px; border-left: 4px solid #ff9800;">
              <p style="margin: 0; font-size: 14px; color: #e65100;">
                ⏰ <strong>Important:</strong> This code will expire in 15 minutes.
              </p>
            </div>
            
            <div style="margin-top: 15px; padding: 15px; background: #e3f2fd; border-radius: 8px; border-left: 4px solid #2196f3;">
              <p style="margin: 0; font-size: 14px; color: #1565c0;">
                🔐 <strong>Google Login:</strong> You signed in with Google and have 2FA enabled.
              </p>
            </div>
            
            <div style="margin-top: 15px; padding: 15px; background: #ffebee; border-radius: 8px; border-left: 4px solid #f44336;">
              <p style="margin: 0; font-size: 14px; color: #c62828;">
                🛡️ <strong>Security Alert:</strong> If you didn't attempt to login, please secure your account immediately.
              </p>
            </div>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
            <p>© 2025 SL Designers. All rights reserved.</p>
          </div>
        </div>
      `
    };

    const result = await sendEmail(mailOptions);

    res.status(200).json({
      status: 'success',
      message: 'Login OTP sent successfully',
      data: {
        email: user.email,
        sessionId: sessionId
      }
    });
  } catch (error) {
    console.error('Send Google login OTP error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to send login OTP'
    });
  }
};

export const verifyGoogleLogin2FAWithSession = async (req, res) => {
  try {
    const { sessionId, otp } = req.body;

    if (!sessionId || !otp) {
      return res.status(400).json({
        status: 'error',
        message: 'Session ID and OTP are required'
      });
    }

    const sessionData = googleTwoFactorSessions.get(sessionId);

    if (!sessionData) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid or expired session'
      });
    }

    if (sessionData.expires < Date.now()) {
      googleTwoFactorSessions.delete(sessionId);
      return res.status(400).json({
        status: 'error',
        message: 'Session expired'
      });
    }

    const user = await User.findById(sessionData.userId);

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    if (user.resetOtp !== otp || user.resetOtp === "") {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid OTP'
      });
    }

    if (user.resetOtpExpireAt < Date.now()) {
      return res.status(400).json({
        status: 'error',
        message: 'OTP has expired'
      });
    }

    user.resetOtp = "";
    user.resetOtpExpireAt = null;
    await user.save();

    googleTwoFactorSessions.delete(sessionId);

    const token = jwt.sign(
      {
        userId: user._id,
        username: user.username,
        email: user.email,
        role: user.role || 'user',
        googleId: user.googleId
      },
      jwt_secret,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      status: 'success',
      message: 'Google login with 2FA successful',
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
    console.error('Verify Google login 2FA with session error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to verify Google login 2FA'
    });
  }
};

export const disable2FA = async (req, res) => {
  try {
    const { currentPassword } = req.body;
    const userId = req.user.userId;

    if (!currentPassword) {
      return res.status(400).json({
        status: 'error',
        message: 'Current password is required to disable 2FA'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    if (user.googleId && !user.password) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot verify password for Google account. 2FA cannot be disabled.'
      });
    }

    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(400).json({
        status: 'error',
        message: 'Current password is incorrect'
      });
    }

    user.enableTwoFactor = false;
    user.twoFactorEmail = null;

    user.resetOtp = "";
    user.resetOtpExpireAt = null;

    await user.save();

    try {
      const mailOptions = {
        to: user.email,
        subject: '2FA Disabled - SL Designers',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #021D3B 0%, #0f2a4a 100%); color: white; border-radius: 10px;">
              <h2 style="margin: 0; color: white;">🔓 2FA Disabled</h2>
              <p style="margin: 10px 0 0 0; color: #D8B46A;">SL Designers Admin Portal</p>
            </div>
            
            <div style="padding: 30px 20px; background: #f8f9fa; border-radius: 10px; margin: 20px 0;">
              <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
                Hello <strong>${user.username}</strong>,
              </p>
              
              <div style="background: #fff3e0; padding: 20px; border-radius: 8px; border-left: 4px solid #ff9800; margin: 20px 0;">
                <p style="margin: 0; font-size: 14px; color: #e65100;">
                  ⚠️ <strong>Notice:</strong> Two-Factor Authentication has been disabled for your account.
                </p>
              </div>
              
              <p style="font-size: 14px; color: #333;">
                <strong>When:</strong> ${new Date().toLocaleString('en-IN', {
          timeZone: 'Asia/Kolkata',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}
              </p>
              
              <div style="margin-top: 20px; padding: 15px; background: #ffebee; border-radius: 8px; border-left: 4px solid #f44336;">
                <p style="margin: 0; font-size: 14px; color: #c62828;">
                  🛡️ <strong>Security Warning:</strong> Your account is now less secure. Consider re-enabling 2FA for better protection.
                </p>
              </div>
              
              <div style="margin-top: 15px; padding: 15px; background: #ffebee; border-radius: 8px; border-left: 4px solid #f44336;">
                <p style="margin: 0; font-size: 14px; color: #c62828;">
                  🚨 <strong>Important:</strong> If you didn't disable 2FA, please contact support immediately and secure your account.
                </p>
              </div>
            </div>
            
            <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
              <p>© 2025 SL Designers. All rights reserved.</p>
            </div>
          </div>
        `
      };

      const result = await sendEmail(mailOptions);
    } catch (emailError) {
      console.error('Failed to send 2FA disabled notification:', emailError);
    }

    res.status(200).json({
      status: 'success',
      message: '2FA has been disabled successfully'
    });
  } catch (error) {
    console.error('Disable 2FA error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to disable 2FA'
    });
  }
};

export const sendEmailVerification = async (req, res) => {
  try {
    const { newEmail } = req.body;
    const userId = req.user.userId;

    if (!newEmail) {
      return res.status(400).json({
        status: 'error',
        message: 'New email address is required'
      });
    }

    const existingUser = await User.findOne({ email: newEmail });
    if (existingUser && existingUser._id.toString() !== userId) {
      return res.status(400).json({
        status: 'error',
        message: 'Email address is already in use'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpireAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.emailVerificationOtp = otp;
    user.emailVerificationOtpExpireAt = otpExpireAt;
    user.pendingEmail = newEmail;
    await user.save();

    try {
      await sendEmail({
        to: newEmail,
        subject: 'Email Verification - SL Designers',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #021D3B 0%, #0f2a4a 100%); color: white; border-radius: 10px;">
              <h2 style="margin: 0; color: white;">✉️ Email Verification</h2>
              <p style="margin: 10px 0 0 0; color: #D8B46A;">SL Designers</p>
            </div>
            
            <div style="padding: 30px 20px; background: #f8f9fa; border-radius: 10px; margin: 20px 0;">
              <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
                Hello <strong>${user.username}</strong>,
              </p>
              
              <p style="font-size: 16px; color: #333; margin-bottom: 30px;">
                You requested to verify this email address for your SL Designers account. Please use the OTP below to complete the verification:
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <div style="display: inline-block; background: #021D3B; color: white; padding: 20px 40px; border-radius: 10px; font-size: 28px; font-weight: bold; letter-spacing: 5px; margin: 10px;">
                  ${otp}
                </div>
              </div>
              
              <p style="font-size: 14px; color: #666; margin-top: 30px;">
                This OTP is valid for 10 minutes only. If you didn't request this verification, please ignore this email.
              </p>
            </div>
            
            <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
              <p>&copy; 2024 SL Designers. All rights reserved.</p>
            </div>
          </div>
        `
      });

      res.status(200).json({
        status: 'success',
        message: 'Verification OTP sent to your email'
      });
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      res.status(500).json({
        status: 'error',
        message: 'Failed to send verification email'
      });
    }
  } catch (error) {
    console.error('Send email verification error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to send verification email'
    });
  }
};

export const verifyEmailChange = async (req, res) => {
  try {
    const { newEmail, otp } = req.body;
    const userId = req.user.userId;

    if (!newEmail || !otp) {
      return res.status(400).json({
        status: 'error',
        message: 'Email and OTP are required'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    if (user.emailVerificationOtp !== otp) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid OTP'
      });
    }

    if (!user.emailVerificationOtpExpireAt || user.emailVerificationOtpExpireAt < new Date()) {
      return res.status(400).json({
        status: 'error',
        message: 'OTP has expired'
      });
    }

    if (user.pendingEmail !== newEmail) {
      return res.status(400).json({
        status: 'error',
        message: 'Email does not match the verification request'
      });
    }

    user.email = newEmail;
    user.isVerified = true; // Mark as verified when they verify email
    user.emailVerificationOtp = null;
    user.emailVerificationOtpExpireAt = null;
    user.pendingEmail = null;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Email updated successfully'
    });
  } catch (error) {
    console.error('Verify email change error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to verify email'
    });
  }
};

export const sendAccountVerification = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        status: 'error',
        message: 'Account is already verified'
      });
    }

    if (user.authProvider === 'google') {
      return res.status(400).json({
        status: 'error',
        message: 'Google accounts are automatically verified'
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpireAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.emailVerificationOtp = otp;
    user.emailVerificationOtpExpireAt = otpExpireAt;
    await user.save();

    try {
      await sendEmail({
        to: user.email,
        subject: 'Account Verification - SL Designers',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #021D3B 0%, #0f2a4a 100%); color: white; border-radius: 10px;">
              <h2 style="margin: 0; color: white;">🔐 Account Verification</h2>
              <p style="margin: 10px 0 0 0; color: #D8B46A;">SL Designers</p>
            </div>
            
            <div style="padding: 30px 20px; background: #f8f9fa; border-radius: 10px; margin: 20px 0;">
              <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
                Hello <strong>${user.username}</strong>,
              </p>
              
              <p style="font-size: 16px; color: #333; margin-bottom: 30px;">
                Welcome to SL Designers! Please verify your account using the OTP below:
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <div style="display: inline-block; background: #021D3B; color: white; padding: 20px 40px; border-radius: 10px; font-size: 28px; font-weight: bold; letter-spacing: 5px; margin: 10px;">
                  ${otp}
                </div>
              </div>
              
              <p style="font-size: 14px; color: #666; margin-top: 30px;">
                This OTP is valid for 10 minutes only. After verification, you'll have full access to your account.
              </p>
            </div>
            
            <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
              <p>&copy; 2024 SL Designers. All rights reserved.</p>
            </div>
          </div>
        `
      });

      res.status(200).json({
        status: 'success',
        message: 'Verification OTP sent to your email'
      });
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      res.status(500).json({
        status: 'error',
        message: 'Failed to send verification email'
      });
    }
  } catch (error) {
    console.error('Send account verification error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to send verification email'
    });
  }
};

export const verifyAccount = async (req, res) => {
  try {
    const { otp } = req.body;
    const userId = req.user.userId;

    if (!otp) {
      return res.status(400).json({
        status: 'error',
        message: 'OTP is required'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        status: 'error',
        message: 'Account is already verified'
      });
    }

    if (user.emailVerificationOtp !== otp) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid OTP'
      });
    }

    if (!user.emailVerificationOtpExpireAt || user.emailVerificationOtpExpireAt < new Date()) {
      return res.status(400).json({
        status: 'error',
        message: 'OTP has expired'
      });
    }

    user.isVerified = true;
    user.emailVerificationOtp = null;
    user.emailVerificationOtpExpireAt = null;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Account verified successfully'
    });
  } catch (error) {
    console.error('Verify account error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to verify account'
    });
  }
};