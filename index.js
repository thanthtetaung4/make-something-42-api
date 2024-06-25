require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 5000;

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIEND_SECRET;
const redirectUri = process.env.REDIRECT_URI;

app.use(cors()); // Enable CORS
app.use(bodyParser.json()); // Parse JSON bodies

app.get('/', (req, res) => {
  res.send('Hello from the server!');
});

// Route to handle token exchange
app.post('/exchange_token', (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).send('Authorization code is missing');
  }

  const tokenEndpoint = 'https://api.intra.42.fr/oauth/token';

  const data = {
    grant_type: 'authorization_code',
    client_id: clientId,
    client_secret: clientSecret,
    code: code,
    redirect_uri: redirectUri,
  };

  axios.post(tokenEndpoint, data)
    .then(response => {
      console.log('Access Token:', response.data.access_token);
      res.json({ access_token: response.data.access_token });
    })
    .catch(error => {
      console.error('Error fetching access token:', error);
      res.status(500).send('Error fetching access token');
    });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
