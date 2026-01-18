import mongoose from 'mongoose';

const recordSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  fileHash: {
    type: String,
    required: true
  },
  merkleRoot: {
    type: String,
    required: true
  },
  fileCount: {
    type: Number,
    default: 1
  },
  merkleProof: {
    type: [String],
    default: []
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  verified: {
    type: Boolean,
    default: false
  },
  verifiedAt: {
    type: Date
  }
});

export default mongoose.model('Record', recordSchema);
