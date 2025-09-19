const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const { RedisStore } = require('connect-redis');
const session = require('express-session');
const { createClient}  = require('redis');
require('dotenv').config();
const { connectRabbitMQ } = require('./src/v1/services/rabbitmq/connection.rabbitmq');
const authRoutes = require('./src/v1/modules/auth/auth.route');
const consumeOTPRequests = require('./src/v1/modules/notifications/otp.consumer');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
  })
  .catch(err => { console.log(err);
  process.exit(1);
});

connectRabbitMQ()
    .then(() => {
        console.log("RabbitMQ connection established.");
        consumeOTPRequests();
    })
    .catch((error) => {
        console.error("Application failed to start due to connection error:", error);
        process.exit(1); // Exit the process if the connection fails
    });


const redisClient = createClient({
  url: process.env.REDIS_URL
});
redisClient.connect().catch(console.error);
const redisStore = new RedisStore({
  client: redisClient,
  prefix: "FixKonet:"
});


app.use(session({
  store: redisStore,
  secret: process.env.JWT_SECRET,
  name: 'sessionId',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
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
