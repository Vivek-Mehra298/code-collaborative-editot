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
3. In Network Access, allow Render to connect. For a first deploy you can temporarily allow `0.0.0.0/0`, then tighten it later.
4. Copy the Atlas connection string and set it as `MONGO_URI` in Render.

### Render backend (Recommended)
This repository includes a `render.yaml` blueprint file for easy deployment on Render:
1. Go to **Render Dashboard** and click **New** > **Blueprint**.
2. Connect your GitHub repository.
3. Render will automatically detect the configuration in `render.yaml`.
4. Provide the `MONGO_URI` (your MongoDB Atlas connection string) and deploy.

Alternatively, to deploy manually as a Web Service on Render:
- **Runtime**: `Node`
- **Root Directory**: `server`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- Configure environment variables:
  ```env
  NODE_ENV=production
  MONGO_URI=your-atlas-connection-string
  JWT_SECRET=your-long-random-secret
  ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app
  ```

### Vercel frontend
Set Vercel project root to `client` and configure:

```env
NEXT_PUBLIC_API_URL=https://your-render-subdomain.onrender.com/api
NEXT_PUBLIC_SOCKET_URL=https://your-render-subdomain.onrender.com
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
