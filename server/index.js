import express from 'express';
import session from 'express-session';
import passport from 'passport';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { configureSaml } from './config/saml.js';
import authRoutes from './routes/auth.js';

const app = express();
const PORT = process.env.SAML_SERVER_PORT || 3001;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// Session configuration (required for SAML)
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Configure SAML strategy
configureSaml();

// Routes
app.use('/api/saml', authRoutes);

app.listen(PORT, () => {
  console.log(`SAML Auth Server running on http://localhost:${PORT}`);
});
