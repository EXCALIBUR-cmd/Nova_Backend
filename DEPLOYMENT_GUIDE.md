# Chat App - Deployment Guide

## Overview
This guide covers deploying the Chat App (MERN stack with Groq AI) to production.

**Tech Stack:**
- **Frontend:** React 19, Vite, Axios, React Router, React Markdown
- **Backend:** Node.js/Express, MongoDB, Groq API, JWT Auth
- **Real-time:** HTTP REST Polling (1-second intervals)
- **Memory:** Dual-memory system (STM: 25 messages + LTM: Vector embeddings)
- **Responsive:** Mobile-first design with sidebar overlay on tablets

---

## Deployment Options

### Option 1: Render.com (Recommended - Free tier available)

#### Step 1: Prepare Backend for Deployment

1. Update `Backend/server.js` to use environment variables:
```javascript
const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI;
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const JWT_SECRET = process.env.JWT_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL;
```

2. Add start script to `Backend/package.json`:
```json
"scripts": {
  "dev": "npx nodemon server.js",
  "start": "node server.js"
}
```

3. Create `Backend/render.yaml`:
```yaml
services:
  - type: web
    name: chat-gpt-backend
    env: node
    plan: free
    buildCommand: npm install
    startCommand: node server.js
    envVars:
      - key: MONGODB_URI
        sync: false
      - key: GROQ_API_KEY
        sync: false
      - key: JWT_SECRET
        sync: false
      - key: FRONTEND_URL
        sync: false
      - key: NODE_ENV
        value: production
```

#### Step 2: Prepare Frontend for Deployment

1. Update `Frontend/src/pages/Chat.jsx` to use environment variables:
```javascript
// Replace hardcoded backend URL
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
```

2. Create `Frontend/.env.production`:
```
VITE_API_URL=https://your-backend-url.onrender.com
```

3. Update `Frontend/vite.config.js`:
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
})
```

#### Step 3: Deploy to Render

1. **Sign up** at [render.com](https://render.com)

2. **Deploy Backend:**
   - Connect your GitHub repository
   - New → Web Service
   - Select repository
   - Settings:
     - Name: `chat-gpt-backend`
     - Runtime: Node
     - Build command: `npm install`
     - Start command: `node server.js`
   - Add Environment Variables (see below)
   - Deploy

3. **Deploy Frontend:**
   - New → Static Site
   - Select repository
   - Settings:
     - Name: `chat-gpt-frontend`
     - Build command: `npm run build`
     - Publish directory: `dist`
   - Deploy

4. **Environment Variables for Backend:**
   ```
   MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/chatapp
   GROQ_API_KEY=your_groq_api_key_here
   JWT_SECRET=your_jwt_secret_here
   FRONTEND_URL=https://your-frontend-url.onrender.com
   NODE_ENV=production
   ```

---

### Option 2: Vercel + Railway (Alternative)

#### Frontend on Vercel:

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
cd Frontend
vercel --prod
```

3. Add environment variables in Vercel dashboard:
```
VITE_API_URL=https://your-backend-url.railway.app
```

#### Backend on Railway:

1. Sign up at [railway.app](https://railway.app)
2. Connect GitHub
3. Create new service from repo
4. Add environment variables
5. Deploy

---

### Option 3: Heroku (Classic - May require paid dyno)

1. Install Heroku CLI
2. Create `Backend/Procfile`:
```
web: node server.js
```

3. Deploy:
```bash
heroku login
heroku create your-app-name
git push heroku main
heroku config:set MONGODB_URI=... GROQ_API_KEY=...
```

---

## Database Setup (MongoDB Atlas)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free account
3. Create cluster (M0 free tier)
4. Get connection string:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/chatapp?retryWrites=true&w=majority
   ```
5. Add to environment variables as `MONGODB_URI`

---

## Environment Variables Checklist

### Backend (.env)
```
MONGODB_URI=mongodb+srv://...
GROQ_API_KEY=your_api_key
JWT_SECRET=your_secret_key_min_32_chars
FRONTEND_URL=https://your-frontend-domain.com
NODE_ENV=production
PORT=3001
```

### Frontend (.env.production)
```
VITE_API_URL=https://your-backend-domain.com
```

---

## Pre-Deployment Checklist

- [ ] Backend uses environment variables
- [ ] Frontend API URL is configurable
- [ ] MongoDB Atlas cluster created
- [ ] Groq API key obtained
- [ ] JWT_SECRET is strong (32+ chars)
- [ ] CORS configured for frontend domain
- [ ] All node_modules removed from git
- [ ] .env files in .gitignore
- [ ] Build process tested locally
- [ ] API endpoints tested in production mode
- [ ] Database backups configured (MongoDB Atlas)

---

## Post-Deployment Steps

1. **Test API endpoints:**
   ```bash
   curl https://your-backend-url/api/health
   ```

2. **Verify frontend loads:**
   - Visit https://your-frontend-url
   - Check browser console for errors
   - Test authentication flow
   - Send a test message

3. **Monitor logs:**
   - Check Render/Railway/Heroku logs for errors
   - Monitor MongoDB Atlas metrics
   - Check Groq API usage

4. **Set up monitoring:**
   - Enable alerts for failed requests
   - Monitor API response times
   - Set up database backup alerts

---

## Production Optimization

### Backend:
```javascript
// Enable compression
app.use(compression());

// Rate limiting
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/', limiter);
```

### Frontend:
```bash
# Build is optimized by Vite automatically
npm run build

# Check bundle size
npm install -g vite
vite build --analyze
```

---

## Troubleshooting

### Backend won't start
- Check environment variables are set
- Verify MongoDB connection string
- Check Node version compatibility
- Review logs for errors

### Frontend can't connect to API
- Verify CORS settings in backend
- Check API URL in .env.production
- Verify backend is running
- Check browser network tab

### Messages not loading
- Check MongoDB connection
- Verify JWT token validity
- Check polling interval (1 sec)
- Review backend logs

### Database connection fails
- Verify MongoDB Atlas IP whitelist
- Check connection string format
- Ensure database exists
- Verify username/password

---

## Scaling Considerations

1. **Move to paid dynos** if traffic exceeds free tier
2. **Enable MongoDB Atlas auto-scaling**
3. **Implement message pagination** (currently loads all messages)
4. **Add Redis caching** for frequently accessed chats
5. **Implement CDN** for static assets (Cloudflare, AWS CloudFront)
6. **Use WebSocket** instead of polling for real-time (current polling at 1 sec)

---

## Security Checklist

- [ ] JWT_SECRET is strong and unique
- [ ] HTTPS enforced on both frontend and backend
- [ ] CORS configured to specific domains (not *)
- [ ] Environment variables never committed to git
- [ ] Database authentication enabled
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] SQL/NoSQL injection prevention
- [ ] XSS protection enabled
- [ ] CSRF tokens for state-changing requests

---

## Support

For issues:
1. Check logs on deployment platform
2. Verify environment variables
3. Test API with Postman
4. Check browser console for frontend errors
5. Review MongoDB Atlas metrics
