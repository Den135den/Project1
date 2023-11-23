const express = require('express');
const app = new express();
const cors = require('cors');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const { ConnectDB, getDB } = require('./connectingDB');
const { ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

let DB;

ConnectDB((error) => {
  if (!error) {
    app.listen(5000, function () {
      console.log('Server work');
      DB = getDB();
    });
  } else {
    console.log(error);
  }
});



//Send  data  post register in MongoDB 
app.post('/register', async function (req, res) {
  const { username, login, password } = req.body;

  const collection = await DB.collection('test');
  const user = await collection.findOne({ $or: [{ username }, { login }] });

  let data = {};

  if (user) {
    data.message = 'User exists';
    res.status(409).json(data.message);
  } else {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(password, salt);
    data.usingDB = await collection.insertOne({ username, login, password: hash });

    res.status(200).json(data.usingDB);
  }
});

function generateToken(token, key) {
  return jwt.sign(token, key, { expiresIn: '1h' });
}

//Send  data  post login in MongoDB 
app.post('/login', async function (req, res) {
  const { username, login, password } = req.body;

  try {
    const user = await DB.collection('test').findOne({ $or: [{ username }, { login }] });

    if (user) {
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (passwordMatch) {
        const token = { userId: user._id, login: login };
        const secretKey = 'key';
        const f = generateToken(token, secretKey);
        res.status(200).json({ jwt: f });
      } else {
        const fail = 'Login failed';
        res.status(404).json(fail);
      }
    } else {
      const dataLogin = 'User is not found';
      res.status(500).json(dataLogin);
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.get('/getSrver', async function (req, res) {
  let data = { registe: 'Register', id: 1 };
  res.status(200).json(data);
});

//Find data with MongoDB
app.get('/data', async function (req, res) {
  const { login } = req.query;

  try {
    let data = await DB.collection('test').findOne(req.query);
    if (data) {
      res.status(200).json(data);
    } else {
      res.status(404).json({ error: 'Дані не знайдено' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

//Delete document in MongoDB
app.get('/d', function (req, res) {
  try {
    const connection = DB.collection('test');
    const drop = connection.deleteMany();
    res.status(200).json(drop);
  } catch (err) {
    res.status(500).json(`${err} delete`);
  }
});

// Middleware function to check JWT
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  jwt.verify(token, 'your_secret_key', (err, user) => {
    if (err) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    req.user = user;
    next();
  });
};

// Middleware for handling missing or invalid JWT
const handleUnauthorized = (req, res, next) => {
  return res.status(401).json({ message: 'Unauthorized' });
};

// Apply the middleware to all routes except /login and /register
app.use((req, res, next) => {
  if (req.path !== '/login' && req.path !== '/register') {
    authenticateToken(req, res, next);
  } else {
    next();
  }
});

// Apply handleUnauthorized middleware for all routes except /login and /register
app.use((req, res, next) => {
  if (req.path !== '/login' && req.path !== '/register' && !req.user) {
    handleUnauthorized(req, res, next);
  } else {
    next();
  }
});

// Your protected endpoints go here
app.get('/protected-endpoint', (req, res) => {
  const userId = req.user.userId;
  res.json({ message: 'This is a protected endpoint', userId });
});

// Example of handling unauthorized requests for a specific endpoint
app.get('/user', (req, res, next) => {
  if (!req.user) {
    return handleUnauthorized(req, res, next);
  }
  res.json({ message: 'User details', user: req.user });
});
