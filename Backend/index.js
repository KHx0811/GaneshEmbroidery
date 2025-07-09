import express from 'express';
import cors from 'cors';
import config from './config.js';
import routes from './Routes/index.js';
import { ConnectToDB } from './Services/database.js';
import passport from 'passport';
import session from 'express-session';

const { port, client_url } = config;
const app = express();

app.use(cors({
  origin: client_url || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self' 'unsafe-inline' 'unsafe-eval' data:; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://accounts.google.com https://gapi.google.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com data:; " +
    "img-src 'self' data: https: blob: http://localhost:5000; " +
    "connect-src 'self' https://accounts.google.com https://oauth2.googleapis.com ws: wss: http://localhost:5000; " +
    "frame-src 'self' https://accounts.google.com; " +
    "object-src 'none';"
  );
  
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  next();
});

app.use(express.json({ limit: '100mb', parameterLimit: 50000 }));
app.use(express.urlencoded({ extended: true, limit: '100mb', parameterLimit: 50000 }));

app.use(session({ 
  secret: 'ItsSecret', 
  resave: false, 
  saveUninitialized: false,
  cookie: {
    secure: false,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

app.use(passport.initialize());
app.use(passport.session());

app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});

app.use("/", routes);




ConnectToDB();

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

export default app;


