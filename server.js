const express = require('express');
require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const newsRoutes = require('./routes/newsRoutes');
const adminRoutes = require('./routes/adminRoutes');
const galleryRoutes = require('./routes/galleryRoutes');
const cors = require('cors');

const app = express();

app.use(cors());

const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const newsDir = './uploads/news';
const galleryDir = './uploads/gallery';
if (!fs.existsSync(newsDir)) fs.mkdirSync(newsDir, { recursive: true });
if (!fs.existsSync(galleryDir)) fs.mkdirSync(galleryDir, { recursive: true });

mongoose.connect(process.env.MONGO_URI, {
}).then(() => {
    console.log('MongoDB connected');
}).catch(err => {
    console.error('MongoDB connection error:', err);
});

app.use('/api/news', newsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/gallery', galleryRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
