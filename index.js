require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const port = process.env.PORT || 5000;

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIEND_SECRET;
const redirectUri = process.env.REDIRECT_URI;

app.use(cors()); // Enable CORS
app.use(bodyParser.json()); // Parse JSON bodies

app.get("/", (req, res) => {
  res.send("Hello from the server!");
});

// Route to handle token exchange
app.post("/exchange_token", (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).send("Authorization code is missing");
  }

  const tokenEndpoint = "https://api.intra.42.fr/oauth/token";

  const data = {
    grant_type: "authorization_code",
    client_id: clientId,
    client_secret: clientSecret,
    code: code,
    redirect_uri: redirectUri,
  };

  axios
    .post(tokenEndpoint, data)
    .then((response) => {
      console.log("Access Token:", response.data.access_token);
      res.json({ access_token: response.data.access_token });
    })
    .catch((error) => {
      console.error("Error fetching access token:", error);
      res.status(500).send("Error fetching access token");
    });
});

//API endpoint for campus data
app.post("/api/get_campus_data", (req, res) => {
  // console.log("req body", req.body);
  const { accessToken } = req.body;
  // console.log("accessToekn".accessToken);
  if (!accessToken) {
    return res.status(400).send("Access token is missing");
  }

  const apiUrl = "https://api.intra.42.fr/v2/campus";

  axios
    .get(apiUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
    .then((response) => {
      console.log("Campus data:", response.data);
      res.json(response.data);
    })
    .catch((error) => {
      console.error("Error fetching campus data:", error);
      res.status(500).send("Error fetching campus data");
    });
});

//API endpoint for project data
// app.post("/api/get_project_data", (req, res) => {
//   // console.log("req body", req.body);
//   const { accessToken } = req.body;
//   // console.log("accessToekn".accessToken);
//   if (!accessToken) {
//     return res.status(400).send("Access token is missing");
//   }

//   const apiUrl =
//     "https://api.intra.42.fr/v2/cursus/21/projects?page[number]=50";

//   axios
//     .get(apiUrl, {
//       headers: {
//         Authorization: `Bearer ${accessToken}`,
//       },
//     })
//     .then((response) => {
//       console.log("project data:", response.data);
//       res.json(response.data);
//     })
//     .catch((error) => {
//       console.error("Error fetching project data:", error);
//       res.status(500).send("Error fetching project data");
//     });
// });

app.post("/api/get_project_data", async (req, res) => {
  const { accessToken } = req.body;
  if (!accessToken) {
    return res.status(400).send("Access token is missing");
  }

  const apiUrl = "https://api.intra.42.fr/v2/cursus/21/projects";
  const allProjects = [];
  let page = 1;
  const rateLimitDelay = 500; // 2 requests per second, so 500 ms delay

  try {
    while (true) {
      const response = await axios.get(`${apiUrl}?page[number]=${page}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const projects = response.data;

      if (projects.length === 0) {
        break; // Exit loop if no more projects are returned
      }
      allProjects.push(...projects);
      page++;

      if (projects.length < 30) {
        break; // If fewer than 30 projects are returned, this is the last page
      }

      // Wait before making the next request to respect the rate limit
      await new Promise((resolve) => setTimeout(resolve, rateLimitDelay));
    }

    res.json(allProjects);
  } catch (error) {
    console.error("Error fetching project data:", error);
    res.status(500).send("Error fetching project data");
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
