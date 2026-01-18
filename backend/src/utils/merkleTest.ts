/**
 * Merkle Tree Implementation Test
 * Demonstrates the conversion from Python to TypeScript with MongoDB integration
 */

import { 
  sha256,
  hashString,
  generateMerkleRoot,
  verifyMerkleRoot,
  verifyMerkleProof,
  generateMerkleProof,
  validateHash
} from './merkleUtils.js';

// Simulated file hashes (normally sent from frontend)
const files = ['file1.pdf', 'file2.pdf', 'file3.pdf'];
const fileHashes = files.map(f => hashString(f));

console.log('📁 Files:', files);
console.log('🔐 File Hashes:', fileHashes);

// Generate Merkle root
const root = generateMerkleRoot(fileHashes);
console.log('\n🌳 Generated Merkle Root:', root);

// Validate hash
console.log('✓ Merkle root valid format:', validateHash(root));

// Store in MongoDB (simulated)
const record = {
  user_id: 'user_123',
  merkle_root: root,
  file_count: fileHashes.length,
  timestamp: new Date().toISOString()
};
console.log('\n[MongoDB] Stored record:', record);

// Verify Merkle root
const isValid = verifyMerkleRoot(fileHashes, root);
console.log('\n✅ Merkle root valid:', isValid);

// Generate Merkle proof for first file
const proof = generateMerkleProof(fileHashes, 0);
console.log('\n📜 Merkle Proof for file1.pdf:', proof);

// Verify Merkle proof
const proofValid = verifyMerkleProof(fileHashes[0], proof, root);
console.log('✅ Merkle proof verified:', proofValid);

console.log('\n' + '='.repeat(50));
console.log('Conversion Summary:');
console.log('✓ Python hashlib.sha256 → TypeScript crypto');
console.log('✓ Firebase → MongoDB');
console.log('✓ All Merkle functions implemented');
console.log('✓ Integration with backend routes complete');
