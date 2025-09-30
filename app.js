const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Home / form route with categories passed to EJS
app.get('/', (req, res) => {
  res.render('index', { 
    categories: ["Any","Programming","Misc","Dark","Pun","Spooky","Christmas"] 
  });
});

// Handle form submission
app.post('/get-joke', async (req, res) => {
  try {
    const { category = 'Any', type = '', safeMode = '', amount = '1', name = '' } = req.body;

    const base = `https://v2.jokeapi.dev/joke/${encodeURIComponent(category)}`;
    const params = new URLSearchParams();

    if (type && type !== 'both') params.append('type', type);
    if (safeMode === 'on') params.append('safe-mode', '');
    if (amount && amount !== '1') params.append('amount', amount);

    const url = `${base}?${params.toString()}`;
    const response = await axios.get(url);

    const data = response.data;

    if (data.error) {
      return res.status(400).render('error', { message: data.message || 'Error from JokeAPI', details: data });
    }

    let jokes = [];
    if (data.jokes && Array.isArray(data.jokes)) {
      jokes = data.jokes;
    } else {
      jokes = [data];
    }

    res.render('result', {
      name: name ? name.trim() : null,
      jokes
    });

  } catch (err) {
    console.error('API error:', err?.response?.data || err.message || err);
    let message = 'Unexpected error while contacting JokeAPI.';
    if (err?.response?.status) message += ` (HTTP ${err.response.status})`;
    res.status(500).render('error', { message, details: err?.response?.data || err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`JokeApp listening on http://localhost:${PORT}`);
});
