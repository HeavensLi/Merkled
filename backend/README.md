# Merkled Backend

Node.js/Express backend with MongoDB integration for the Merkled application.

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. MongoDB Setup

#### Option A: Local MongoDB Installation
1. Download and install MongoDB Community Edition from https://www.mongodb.com/try/download/community
2. Start the MongoDB service (Windows):
   ```bash
   # If installed as a service, it should start automatically
   # Or run mongod.exe from the installation directory
   ```

#### Option B: MongoDB Atlas (Cloud)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account and cluster
3. Get your connection string (e.g., `mongodb+srv://username:password@cluster.mongodb.net/merkled`)

### 3. Environment Configuration

1. Copy `.env.example` to `.env`:
   ```bash
   copy .env.example .env
   ```

2. Update `.env` with your MongoDB connection string:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/merkled
   NODE_ENV=development
   JWT_SECRET=your_secret_key_here
   ```

   **For MongoDB Atlas:**
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/merkled
   ```

### 4. Run the Server

```bash
npm run dev
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication
- **POST** `/api/auth/register` - Register a new user
- **POST** `/api/auth/login` - Login user

### Records
- **GET** `/api/records` - Get all records (requires authentication)
- **POST** `/api/records` - Create a new record
- **PATCH** `/api/records/:id/verify` - Verify a record
- **DELETE** `/api/records/:id` - Delete a record

### Health Check
- **GET** `/api/health` - Server health status

## Database Models

### User
```typescript
{
  email: string (unique)
  password: string (hashed)
  name: string
  createdAt: Date
  updatedAt: Date
}
```

### Record
```typescript
{
  userId: ObjectId (reference to User)
  fileName: string
  fileHash: string (unique)
  merkleRoot: string
  timestamp: Date
  verified: boolean
  verifiedAt: Date
}
```

## Frontend Integration

The frontend should use the API base URL: `http://localhost:5000/api`

Example API call:
```typescript
const response = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'user@example.com', password: 'password' })
});
```

## Troubleshooting

### MongoDB Connection Failed
- Ensure MongoDB is running
- Check your `MONGODB_URI` in `.env`
- For local MongoDB: ensure `mongod` service is active
- For MongoDB Atlas: verify connection string and IP whitelist

### Port Already in Use
- Change the `PORT` in `.env` to an available port

### CORS Issues
- The backend is configured to accept requests from `http://localhost:5173` (frontend)
- Update the CORS origin if your frontend runs on a different port

## Build for Production

```bash
npm run build
npm start
```
