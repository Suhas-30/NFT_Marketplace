const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const getPinnedImages = require('./getPinnedImages');

dotenv.config();

const app = express();
app.use(cors());

app.get('/api/pinned-images', async (req, res) => {
  try {
    const images = await getPinnedImages();
    res.json(images);
  } catch (err) {
    console.error('Error fetching pinned images:', err);
    res.status(500).json({ error: 'Failed to fetch pinned images' });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
