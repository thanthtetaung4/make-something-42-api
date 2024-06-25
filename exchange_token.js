const axios = require('axios');

// Replace with your actual credentials
const clientId = 'u-s4t2ud-a3e511d3fd8fc721f8487342ee8a172ce822c578b1bd1441ceb960941a9c7fe5';
const clientSecret = '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';
const redirectUri = 'http://localhost:5173/';

// Get the authorization code from request (replace with your logic)
const code = req.query.code; // Assuming code is received in query parameters

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
    // Access token is in response.data.access_token
    console.log('Access Token:', response.data.access_token);
    // You can send this token back to your client-side application
  })
  .catch(error => {
    console.error('Error fetching access token:', error);
  });
