import express, { Router, Request, Response } from 'express';
import Record from '../models/Record.js';
import { verifyToken } from '../middleware/auth.js';
import { 
  generateMerkleRoot, 
  verifyMerkleRoot, 
  verifyMerkleProof,
  generateMerkleProof,
  validateHash,
  hashString
} from '../utils/merkleUtils.js';

const router = Router();

// Get all records for authenticated user
router.get('/', verifyToken, async (req: any, res: Response) => {
  try {
    const records = await Record.find({ userId: req.userId });
    res.json(records);
  } catch (error) {
    console.error('Get records error:', error);
    res.status(500).json({ error: 'Failed to fetch records' });
  }
});

// Get verification history
router.get('/history/:userId', verifyToken, async (req: any, res: Response) => {
  try {
    if (req.userId !== req.params.userId) {
      res.status(403).json({ error: 'Unauthorized' });
      return;
    }

    const records = await Record.find({ userId: req.userId }).sort({ timestamp: -1 });
    res.json(records);
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ error: 'Failed to fetch verification history' });
  }
});

// Create new record with Merkle root generation
router.post('/', verifyToken, async (req: any, res: Response) => {
  try {
    const { fileName, fileHash, fileHashes = [] } = req.body;

    if (!fileName || !fileHash) {
      res.status(400).json({ error: 'fileName and fileHash are required' });
      return;
    }

    // If multiple file hashes provided, generate Merkle root
    let merkleRoot: string;
    let fileCount = 1;
    let merkleProof: string[] = [];

    if (fileHashes && fileHashes.length > 0) {
      // Validate all hashes
      for (const hash of fileHashes) {
        if (!validateHash(hash)) {
          res.status(400).json({ error: 'Invalid hash format' });
          return;
        }
      }
      
      try {
        merkleRoot = generateMerkleRoot(fileHashes);
        fileCount = fileHashes.length;
        
        // Generate proof for the first file hash
        const fileHashIndex = fileHashes.indexOf(fileHash);
        if (fileHashIndex !== -1) {
          merkleProof = generateMerkleProof(fileHashes, fileHashIndex);
        }
      } catch (error) {
        res.status(400).json({ error: 'Failed to generate Merkle root' });
        return;
      }
    } else {
      // Single file - use file hash as Merkle root
      if (!validateHash(fileHash)) {
        res.status(400).json({ error: 'Invalid hash format' });
        return;
      }
      merkleRoot = fileHash;
    }

    const record = new Record({
      userId: req.userId,
      fileName,
      fileHash,
      merkleRoot,
      fileCount,
      merkleProof
    });

    await record.save();
    
    res.status(201).json({
      record,
      merkleRoot,
      fileCount,
      verified: false,
      message: '[MongoDB] Stored record successfully'
    });
  } catch (error) {
    console.error('Create record error:', error);
    res.status(500).json({ error: 'Failed to create record' });
  }
});

// Verify Merkle root
router.post('/verify-root', verifyToken, async (req: any, res: Response) => {
  try {
    const { fileHashes, expectedMerkleRoot } = req.body;

    if (!fileHashes || !Array.isArray(fileHashes) || fileHashes.length === 0) {
      res.status(400).json({ error: 'fileHashes array is required' });
      return;
    }

    if (!expectedMerkleRoot) {
      res.status(400).json({ error: 'expectedMerkleRoot is required' });
      return;
    }

    // Validate all hashes
    for (const hash of fileHashes) {
      if (!validateHash(hash)) {
        res.status(400).json({ error: 'Invalid hash format' });
        return;
      }
    }

    try {
      const isValid = verifyMerkleRoot(fileHashes, expectedMerkleRoot);
      res.json({
        isValid,
        fileCount: fileHashes.length,
        message: isValid ? 'Merkle root verified successfully' : 'Merkle root verification failed'
      });
    } catch (error) {
      res.status(400).json({ error: 'Failed to verify Merkle root' });
    }
  } catch (error) {
    console.error('Verify root error:', error);
    res.status(500).json({ error: 'Failed to verify Merkle root' });
  }
});

// Verify Merkle proof
router.post('/verify-proof', verifyToken, async (req: any, res: Response) => {
  try {
    const { leafHash, proof, merkleRoot } = req.body;

    if (!leafHash || !proof || !Array.isArray(proof) || !merkleRoot) {
      res.status(400).json({ error: 'leafHash, proof array, and merkleRoot are required' });
      return;
    }

    try {
      const isValid = verifyMerkleProof(leafHash, proof, merkleRoot);
      res.json({
        isValid,
        message: isValid ? 'Merkle proof verified successfully' : 'Merkle proof verification failed'
      });
    } catch (error) {
      res.status(400).json({ error: 'Failed to verify Merkle proof' });
    }
  } catch (error) {
    console.error('Verify proof error:', error);
    res.status(500).json({ error: 'Failed to verify Merkle proof' });
  }
});

// Update verification status
router.patch('/:id/verify', verifyToken, async (req: any, res: Response) => {
  try {
    const record = await Record.findOne({ _id: req.params.id, userId: req.userId });
    
    if (!record) {
      res.status(404).json({ error: 'Record not found' });
      return;
    }

    record.verified = true;
    record.verifiedAt = new Date();
    await record.save();

    res.json({
      record,
      message: 'Record verified successfully'
    });
  } catch (error) {
    console.error('Verify record error:', error);
    res.status(500).json({ error: 'Failed to verify record' });
  }
});

// Delete record
router.delete('/:id', verifyToken, async (req: any, res: Response) => {
  try {
    const result = await Record.deleteOne({ _id: req.params.id, userId: req.userId });
    
    if (result.deletedCount === 0) {
      res.status(404).json({ error: 'Record not found' });
      return;
    }

    res.json({ message: 'Record deleted successfully' });
  } catch (error) {
    console.error('Delete record error:', error);
    res.status(500).json({ error: 'Failed to delete record' });
  }
});

export default router;
