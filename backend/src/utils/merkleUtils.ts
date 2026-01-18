import crypto from 'crypto';

/**
 * Return SHA-256 hash of given bytes
 */
export function sha256(data: Buffer | string): string {
  if (typeof data === 'string') {
    data = Buffer.from(data, 'utf-8');
  }
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Hash a string using SHA-256
 */
export function hashString(value: string): string {
  return sha256(value);
}

/**
 * Generate a Merkle root from a list of leaf hashes
 */
export function generateMerkleRoot(leaves: string[]): string {
  if (!leaves || leaves.length === 0) {
    throw new Error('Leaf list cannot be empty');
  }

  let level = [...leaves];

  while (level.length > 1) {
    const nextLevel: string[] = [];
    
    for (let i = 0; i < level.length; i += 2) {
      const left = level[i];
      const right = level[i + 1] || left;
      const combinedHash = sha256(left + right);
      nextLevel.push(combinedHash);
    }
    
    level = nextLevel;
  }

  return level[0];
}

/**
 * Verify if computed Merkle root matches expected root
 */
export function verifyMerkleRoot(leaves: string[], expectedRoot: string): boolean {
  try {
    const computedRoot = generateMerkleRoot(leaves);
    return computedRoot === expectedRoot;
  } catch (error) {
    return false;
  }
}

/**
 * Verify a Merkle proof against a known Merkle root
 */
export function verifyMerkleProof(
  leafHash: string,
  proof: string[],
  merkleRoot: string
): boolean {
  try {
    let currentHash = leafHash;

    for (const siblingHash of proof) {
      currentHash = sha256(currentHash + siblingHash);
    }

    return currentHash === merkleRoot;
  } catch (error) {
    return false;
  }
}

/**
 * Validate SHA-256 hash format
 */
export function validateHash(hashValue: string): boolean {
  return typeof hashValue === 'string' && hashValue.length === 64 && /^[a-f0-9]{64}$/.test(hashValue);
}

/**
 * Generate Merkle proof path for verification
 */
export function generateMerkleProof(leaves: string[], leafIndex: number): string[] {
  if (!leaves || leaves.length === 0) {
    throw new Error('Leaf list cannot be empty');
  }

  if (leafIndex < 0 || leafIndex >= leaves.length) {
    throw new Error('Leaf index out of bounds');
  }

  const proof: string[] = [];
  let level = [...leaves];
  let currentIndex = leafIndex;

  while (level.length > 1) {
    const nextLevel: string[] = [];
    
    for (let i = 0; i < level.length; i += 2) {
      const left = level[i];
      const right = level[i + 1] || left;
      
      // Store sibling if this is in our path
      if (i === Math.floor(currentIndex / 2) * 2) {
        const sibling = currentIndex % 2 === 0 ? right : left;
        proof.push(sibling);
      }
      
      const combinedHash = sha256(left + right);
      nextLevel.push(combinedHash);
    }
    
    level = nextLevel;
    currentIndex = Math.floor(currentIndex / 2);
  }

  return proof;
}
