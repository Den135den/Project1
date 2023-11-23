const express = require('express');
const cors = require('cors');
const app = express();
const { ConnectDB, getDB } = require('./connectingDB');
const { ObjectId } = require('mongodb');
const bodyParser = require('body-parser');
let DB;

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

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






app.get('/', function (req, res) {
  res.send('f');
});

app.post('/register', function (req, res) {
  const { username, password } = req.body;

  const connect = DB.collection('test').insertOne({username, password})
  


  res.status(200).json(connect);
});


app.get('/getServer', async function(req, res){
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
})
