const express = require('express');
const Gallery = require('../models/Gallery');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/gallery');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

router.post('/', auth, upload.single('image'), async (req, res) => {
    try {
        const imageUrl = req.file ? `${req.protocol}://${req.get('host')}/uploads/gallery/${req.file.filename}` : null;

        const newGalleryItem = new Gallery({
            image: req.file ? req.file.filename : null,
        });

        const savedGalleryItem = await newGalleryItem.save();

        res.status(201).json({
            message: "Gallery item created successfully",
            galleryItem: { ...savedGalleryItem.toObject(), image: imageUrl }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error creating gallery item", error });
    }
});

router.get('/', async (req, res) => {
    try {
        const galleryItems = await Gallery.find().sort({ _id: -1 });

        const updatedGalleryItems = galleryItems.map(item => ({
            ...item.toObject(),
            image: `${req.protocol}://${req.get('host')}/uploads/gallery/${item.image}`
        }));

        res.status(200).json(updatedGalleryItems);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching gallery items", error });
    }
});


router.get('/:id', async (req, res) => {
    try {
        const galleryItem = await Gallery.findById(req.params.id);
        if (!galleryItem) {
            return res.status(404).json({ message: "Gallery item not found" });
        }

        const updatedGalleryItem = {
            ...galleryItem.toObject(),
            image: `${req.protocol}://${req.get('host')}/uploads/gallery/${galleryItem.image}`
        };
        res.status(200).json(updatedGalleryItem);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching gallery item", error });
    }
});

router.delete('/:id', auth, async (req, res) => {
    try {
        const galleryItem = await Gallery.findById(req.params.id);
        if (!galleryItem) {
            return res.status(404).json({ message: "Gallery item not found" });
        }

        const imagePath = path.join(__dirname, '..', 'uploads', 'gallery', galleryItem.image);
        
        try {
            await fs.promises.unlink(imagePath);
        } catch (err) {
            return res.status(500).json({ message: "Error deleting image file", error: err });
        }


        await Gallery.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Gallery item deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error deleting gallery item", error });
    }
});


module.exports = router;
