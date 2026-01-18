# Merkle Tree API Documentation

This backend implements SHA-256 based Merkle tree functionality with MongoDB storage integration.

## Core Functions

### Utility Functions (`/src/utils/merkleUtils.ts`)

#### `sha256(data: Buffer | string): string`
- Computes SHA-256 hash of given input
- Returns hexadecimal string (64 characters)

#### `hashString(value: string): string`
- Convenience function to hash a string value
- Uses SHA-256 algorithm

#### `generateMerkleRoot(leaves: string[]): string`
- Generates a Merkle root from a list of leaf hashes
- Combines hashes pairwise until single root remains
- **Throws**: Error if leaves array is empty

#### `verifyMerkleRoot(leaves: string[], expectedRoot: string): boolean`
- Verifies if computed Merkle root matches expected root
- Returns true if roots match, false otherwise

#### `verifyMerkleProof(leafHash: string, proof: string[], merkleRoot: string): boolean`
- Verifies a Merkle proof against a known Merkle root
- Combines leaf hash with proof hashes sequentially

#### `generateMerkleProof(leaves: string[], leafIndex: number): string[]`
- Generates the proof path needed to verify a specific leaf
- Returns array of sibling hashes needed for verification

#### `validateHash(hashValue: string): boolean`
- Validates if a string is a valid SHA-256 hash format
- Checks for 64-character hexadecimal string

## API Endpoints

### Records Management

#### `GET /api/records`
Get all records for authenticated user
- **Auth**: Required (JWT token)
- **Response**: Array of Record objects

#### `GET /api/records/history/:userId`
Get verification history for a user
- **Auth**: Required (JWT token)
- **Params**: userId (must match authenticated user)
- **Response**: Array of Record objects (sorted by date)

#### `POST /api/records`
Create new record with Merkle root generation
- **Auth**: Required (JWT token)
- **Body**:
  ```json
  {
    "fileName": "document.pdf",
    "fileHash": "a1b2c3...",
    "fileHashes": ["a1b2c3...", "d4e5f6...", "g7h8i9..."]
  }
  ```
- **Response**:
  ```json
  {
    "record": { _id, userId, fileName, fileHash, merkleRoot, ... },
    "merkleRoot": "string",
    "fileCount": number,
    "verified": false,
    "message": "[MongoDB] Stored record successfully"
  }
  ```

#### `POST /api/records/verify-root`
Verify Merkle root against file hashes
- **Auth**: Required (JWT token)
- **Body**:
  ```json
  {
    "fileHashes": ["hash1", "hash2", "hash3"],
    "expectedMerkleRoot": "root_hash"
  }
  ```
- **Response**:
  ```json
  {
    "isValid": boolean,
    "fileCount": number,
    "message": "Merkle root verified successfully"
  }
  ```

#### `POST /api/records/verify-proof`
Verify Merkle proof for a specific leaf
- **Auth**: Required (JWT token)
- **Body**:
  ```json
  {
    "leafHash": "file_hash",
    "proof": ["sibling1", "sibling2", ...],
    "merkleRoot": "root_hash"
  }
  ```
- **Response**:
  ```json
  {
    "isValid": boolean,
    "message": "Merkle proof verified successfully"
  }
  ```

#### `PATCH /api/records/:id/verify`
Mark a record as verified
- **Auth**: Required (JWT token)
- **Params**: id (Record ID)
- **Response**: Updated record with verification timestamp

#### `DELETE /api/records/:id`
Delete a record
- **Auth**: Required (JWT token)
- **Params**: id (Record ID)
- **Response**: `{ "message": "Record deleted successfully" }`

## Database Schema

### Record Model
```typescript
{
  userId: ObjectId,          // Reference to User
  fileName: string,          // File name
  fileHash: string,          // SHA-256 hash of the file
  merkleRoot: string,        // Merkle root hash
  fileCount: number,         // Number of files in batch (default: 1)
  merkleProof: [string],     // Proof path for verification
  timestamp: Date,           // Creation date
  verified: boolean,         // Verification status
  verifiedAt: Date           // Verification timestamp
}
```

## Usage Example

### 1. Creating a Record with Multiple Files
```bash
curl -X POST http://localhost:5000/api/records \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "fileName": "batch_upload",
    "fileHash": "a1b2c3d4...",
    "fileHashes": [
      "a1b2c3d4...",
      "e5f6g7h8...",
      "i9j0k1l2..."
    ]
  }'
```

### 2. Verifying a Merkle Root
```bash
curl -X POST http://localhost:5000/api/records/verify-root \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "fileHashes": [
      "a1b2c3d4...",
      "e5f6g7h8...",
      "i9j0k1l2..."
    ],
    "expectedMerkleRoot": "computed_root_hash"
  }'
```

### 3. Verifying a Merkle Proof
```bash
curl -X POST http://localhost:5000/api/records/verify-proof \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "leafHash": "a1b2c3d4...",
    "proof": ["sibling_hash1", "sibling_hash2"],
    "merkleRoot": "computed_root_hash"
  }'
```

## Implementation Notes

1. **MongoDB Integration**: Replaces Firebase with MongoDB for persistent storage
2. **SHA-256 Hashing**: Uses Node.js built-in crypto module
3. **Merkle Tree Algorithm**: 
   - Pairs consecutive leaves and hashes them
   - If odd number of leaves, the last leaf is paired with itself
   - Process repeats until single root hash remains
4. **Authentication**: All endpoints require valid JWT token
5. **Validation**: Hash format validated before processing

## Security Considerations

- All hashes are SHA-256 (256-bit)
- Merkle proofs provide cryptographic verification
- Records associated with authenticated user IDs
- Token-based authentication required for all operations
