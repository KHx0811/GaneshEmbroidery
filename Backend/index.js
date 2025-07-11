import express from 'express';
import cors from 'cors';
import config from './config.js';
import routes from './Routes/index.js';
import { ConnectToDB } from './Services/database.js';
import passport from 'passport';
import session from 'express-session';
import MongoStore from 'connect-mongo';

const { port, client_url, mongo_uri, session_secret } = config;
const app = express();

app.use(cors({
  origin: [
    'https://ganesh-embroidery.vercel.app',
    'http://localhost:5173',
    client_url
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
}));

app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self' 'unsafe-inline' 'unsafe-eval' data:; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://accounts.google.com https://gapi.google.com https://checkout.razorpay.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://checkout.razorpay.com; " +
    "font-src 'self' https://fonts.gstatic.com data:; " +
    "img-src 'self' data: https: blob: http://localhost:5000 https://ganesh-embroidery.onrender.com; " +
    "connect-src 'self' https://accounts.google.com https://oauth2.googleapis.com https://api.razorpay.com ws: wss: http://localhost:5000 https://ganesh-embroidery.onrender.com; " +
    "frame-src 'self' https://accounts.google.com https://api.razorpay.com; " +
    "object-src 'none';"
  );
  
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  next();
});

app.use(express.json({ limit: '100mb', parameterLimit: 50000 }));
app.use(express.urlencoded({ extended: true, limit: '100mb', parameterLimit: 50000 }));

app.use('/uploads', express.static('uploads'));
app.use('/images', express.static('images'));

app.use(session({ 
  secret: session_secret, 
  resave: false, 
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: mongo_uri ,
    ttl: 24 * 60 * 60,
    touchAfter: 24 * 3600
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    httpOnly: true
  }
}));

app.use(passport.initialize());
app.use(passport.session());

app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});

app.use("/", routes);

const startServer = async () => {
    try {
        await ConnectToDB();
        
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

export default app;

