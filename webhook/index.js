const express = require('express');
const bodyParser = require('body-parser');
const dialogflowHandler = require('./dialogflow');
require('dotenv').config();
const path = require('path');

const app = express();
app.use(bodyParser.json());

// Serve static files from public directory if it exists
app.use(express.static(path.join(__dirname, '../public')));

// Add a friendly home route
app.get('/', (req, res) => {
  res.send('IAA Chatbot backend is running! Use Dialogflow or POST /webhook for chatbot queries.');
});

app.post('/webhook', dialogflowHandler);

// Change port to 3001
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 