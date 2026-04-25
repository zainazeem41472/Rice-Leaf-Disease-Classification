import Disease from '../models/Disease.js';
import path from 'path';
import { fileURLToPath } from 'url';
import FormData from 'form-data';
import fs from 'fs';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Flask ML backend URL
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5001';

/**
 * Forward image to Flask ML backend for prediction
 */
const callMLBackend = async (imagePath) => {
  try {
    const formData = new FormData();
    formData.append('image', fs.createReadStream(imagePath));

    const response = await axios.post(`${ML_SERVICE_URL}/predict`, formData, {
      headers: formData.getHeaders(),
      timeout: 30000,
    });

    console.log(`✓ ML prediction received: ${response.data.diseaseName} (${response.data.confidence}%)`);
    return response.data;
  } catch (error) {
    const mlError = error?.response?.data?.error
      || error?.response?.data?.message
      || error?.code
      || error?.message
      || 'Unknown ML backend error';

    console.error(`✗ ML backend error: ${mlError}`);
    throw new Error(`ML prediction failed: ${mlError}`);
  }
};

/**
 * @desc    Upload image and detect disease
 * @route   POST /api/disease/upload
 * @access  Public (Flutter) + Private (Web with token)
 */
const uploadAndDetect = async (req, res) => {
  let imagePath = null;
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        message: 'Please upload an image' 
      });
    }

    imagePath = path.join(__dirname, '..', 'uploads', req.file.filename);
    const relativeImagePath = `/uploads/${req.file.filename}`;

    console.log(`📤 Sending image to ML backend: ${req.file.filename}`);

    // Get prediction from Flask
    const prediction = await callMLBackend(imagePath);

    // Validate prediction response
    if (!prediction.diseaseName || !prediction.description) {
      throw new Error('Invalid prediction response from ML backend');
    }

    // Handle irrelevant images — don't save to database
    if (prediction.diseaseName === 'irrelevant_pics') {
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
        console.log(`🗑 Cleaned up irrelevant image: ${imagePath}`);
      }

      return res.status(200).json({
        success: true,
        data: {
          diseaseName: prediction.diseaseName,
          confidence: `${prediction.confidence}%`,
          description: prediction.description,
          treatment: prediction.treatment || 'No treatment information available',
          imagePath: null,
        },
      });
    }

    // ✅ FIX: req.user optional — Flutter (no token) ya Web (token wala) dono handle
    const userId = req.user ? req.user._id : null;

    // Save prediction result to MongoDB
    const diseaseRecord = await Disease.create({
      user: userId,                // null for Flutter, actual ID for Web
      imagePath: relativeImagePath,
      diseaseName: prediction.diseaseName,
      confidence: `${prediction.confidence}%`,
      description: prediction.description,
      treatment: prediction.treatment || 'No treatment information available',
    });

    console.log(`✓ Disease record saved to MongoDB: ${diseaseRecord._id}`);

    res.status(201).json({
      success: true,
      data: diseaseRecord,
    });

  } catch (error) {
    console.error(`✗ Upload and detect error: ${error.message}`);
    
    if (imagePath && fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
      console.log(`🗑 Cleaned up failed upload: ${imagePath}`);
    }

    res.status(500).json({ 
      success: false,
      message: error.message || 'Disease detection failed' 
    });
  }
};

/**
 * @desc    Get all user's disease records (history)
 * @route   GET /api/disease/history
 * @access  Private
 */
const getDiseaseHistory = async (req, res) => {
  try {
    const diseases = await Disease.find({ user: req.user._id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: diseases.length,
      data: diseases,
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

/**
 * @desc    Get single disease record by ID
 * @route   GET /api/disease/:id
 * @access  Private
 */
const getDiseaseById = async (req, res) => {
  try {
    const disease = await Disease.findById(req.params.id);

    if (!disease) {
      return res.status(404).json({ 
        success: false,
        message: 'Disease record not found' 
      });
    }

    if (disease.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to view this record' 
      });
    }

    res.json({
      success: true,
      data: disease,
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

/**
 * @desc    Delete disease record
 * @route   DELETE /api/disease/:id
 * @access  Private
 */
const deleteDisease = async (req, res) => {
  try {
    const disease = await Disease.findById(req.params.id);

    if (!disease) {
      return res.status(404).json({ 
        success: false,
        message: 'Disease record not found' 
      });
    }

    if (disease.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to delete this record' 
      });
    }

    await disease.deleteOne();

    res.json({
      success: true,
      message: 'Disease record deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

export {
  uploadAndDetect,
  getDiseaseHistory,
  getDiseaseById,
  deleteDisease,
};