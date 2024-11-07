const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const News = require('../models/News');
const auth = require('../middleware/auth')

const router = express.Router();


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/news');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });


router.post('/', auth, upload.array('images'), async (req, res) => {
    try {
        const newNews = new News({
            tags: req.body.tags
                .split(/،|,/)
                .map(tag => tag.trim())
                .filter(tag => tag),
            overTitle: req.body.overTitle,
            lead: req.body.lead,
            cat: req.body.cat,
            title: req.body.title,
            des: req.body.des,
            images: req.files.map(file => file.filename),
        });

        const savedNews = await newNews.save();
        res.status(201).json({ message: "News created successfully", news: savedNews });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error creating news", error });
    }
});


router.get('/', async (req, res) => {
    try {
        const news = await News.find().sort({ date: -1 });

        const newsWithFullImagePaths = news.map(item => ({
            ...item._doc,
            images: item.images.map(image => `${req.protocol}://${req.get('host')}/uploads/news/${image}`)
        }));

        res.status(200).json(newsWithFullImagePaths);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching news", error });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const news = await News.findById(req.params.id);
        if (!news) return res.status(404).json({ message: "News not found" });

        const newsWithFullImagePaths = {
            ...news._doc,
            images: news.images.map(image => `${req.protocol}://${req.get('host')}/uploads/news/${image}`)
        };

        res.status(200).json(newsWithFullImagePaths);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching news", error });
    }
});

router.delete('/:id', auth, async (req, res) => {
    try {
        const news = await News.findByIdAndDelete(req.params.id);
        if (!news) return res.status(404).json({ message: "News not found" });

        await Promise.all(news.images.map(async (image) => {
            const filePath = path.join(__dirname, '../uploads/news', image);
            if (fs.existsSync(filePath)) {
                await fs.promises.unlink(filePath);
            }
        }));

        res.status(200).json({ message: "News deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error deleting news", error });
    }
});


router.put('/:id', auth, upload.array('images'), async (req, res) => {
    try {
        const updateData = {
            tags: req.body.tags
                .split(/،|,/)
                .map(tag => tag.trim())
                .filter(tag => tag),
            overTitle: req.body.overTitle,
            lead: req.body.lead,
            cat: req.body.cat,
            title: req.body.title,
            des: req.body.des,
        };

        if (req.files && req.files.length > 0) {
            updateData.images = req.files.map(file => file.filename);

        } else {

            const existingNews = await News.findById(req.params.id);
            if (existingNews) {
                updateData.images = existingNews.images;
            }
        }

        const news = await News.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!news) return res.status(404).json({ message: "News not found" });

        res.status(200).json({ message: "News updated successfully", news });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating news", error });
    }
});



module.exports = router;
