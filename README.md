# DevSync

DevSync is a real-time collaborative code editor built with Next.js, Express, Socket.IO, and MongoDB.

## Stack
- Frontend: Next.js on Vercel
- Backend: Express + Socket.IO on Railway
- Database: MongoDB Atlas

## Local setup

### 1. Install dependencies
```bash
cd server
npm install
```

```bash
cd client
npm install
```

### 2. Create env files
Copy these example files and fill in your values:

```bash
server/.env.example
client/.env.example
```

### 3. Run locally
Backend:
```bash
cd server
npm run dev
```

Frontend:
```bash
cd client
npm run dev
```

## Deployment

### MongoDB Atlas
1. Create an Atlas cluster.
2. Create a database user.
3. In Network Access, allow Railway to connect. For a first deploy you can temporarily allow `0.0.0.0/0`, then tighten it later.
4. Copy the Atlas connection string and set it as `MONGO_URI` in Railway.

### Railway backend
Set Railway root directory to `server` and configure these variables:

```env
NODE_ENV=production
PORT=${{RAILWAY_PUBLIC_PORT}}
MONGO_URI=your-atlas-connection-string
JWT_SECRET=your-long-random-secret
ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app,https://your-preview-domain.vercel.app
```

Use these commands:

```bash
npm install
npm run build
npm run start
```

Backend health check:

```text
/api/health
```

### Vercel frontend
Set Vercel project root to `client` and configure:

```env
NEXT_PUBLIC_API_URL=https://your-railway-domain.up.railway.app/api
NEXT_PUBLIC_SOCKET_URL=https://your-railway-domain.up.railway.app
```

Vercel can use the default Next.js build settings.

## Required environment variables

### Server
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/devsync?retryWrites=true&w=majority
JWT_SECRET=replace-with-a-long-random-secret
ALLOWED_ORIGINS=http://localhost:3000,https://your-frontend-domain.vercel.app
```

`ALLOWED_ORIGINS` supports comma-separated values and wildcard patterns like `https://*.vercel.app`.

### Client
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

## Notes
- The backend now requires `MONGO_URI` and `JWT_SECRET` in all environments.
- CORS and Socket.IO origins are controlled by `ALLOWED_ORIGINS`.
- Railway should expose the Express server on `PORT`.
