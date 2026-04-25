import mongoose from 'mongoose';

const diseaseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, // ✅ Flutter ke liye optional (Web users ka ID save hoga, Flutter ka null)
  },
  imagePath: {
    type: String,
    required: true,
  },
  diseaseName: {
    type: String,
    required: true,
  },
  confidence: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  treatment: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Disease', diseaseSchema);