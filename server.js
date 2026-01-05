const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const { RedisStore } = require('connect-redis');
const session = require('express-session');
const { createClient } = require('redis');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const config = require('./src/v1/config/vars');


const authRoutes = require('./src/v1/modules/auth/auth.route');

const app = express();
const PORT = process.env.PORT || 3000;

// Security Middleware
app.use(helmet());

// Rate Limiting
const limiter = rateLimit({
  windowMs: config.otp.expiry,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// CORS
app.use(cors({
  origin: config.clientUrl,
  credentials: true
}));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



mongoose.connect(config.mongo.uri)
  .then(() => {
    console.log('MongoDB connected');
  })
  .catch(err => {
    console.log(err);
    process.exit(1);
  });




const redisClient = createClient({
<<<<<<< HEAD
  url: config.redis.url,
=======
  url: process.env.REDIS_URL,
>>>>>>> fe1988af3d25f9aa4a63e7a46326250b02fb2876
});
redisClient.connect().catch(console.error);
const redisStore = new RedisStore({
  client: redisClient,
  prefix: "FixKonet:"
});


app.use(session({
  store: redisStore,
  secret: config.jwtSecret,
  name: 'sessionId',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: config.env === 'production',
    httpOnly: true,
    maxAge: config.session.maxAge
  }
}));

// Middleware to attach the single Redis client instance to the request object
app.use((req, res, next) => {
  req.redisClient = redisClient;
  next();
});

// Routes
app.use('/api/v1/auth', authRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
