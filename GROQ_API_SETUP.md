# Getting Groq API Key - Step by Step

## Step 1: Create Groq Account

1. Go to https://console.groq.com
2. Click **"Sign Up"**
3. Enter your email address
4. Check your email and verify
5. Set your password
6. Click **"Create Account"**

---

## Step 2: Access API Keys Dashboard

1. After login, you'll be on the main dashboard
2. Look for **"API Keys"** in the left sidebar
3. Click on **"API Keys"** or **"Keys"**

---

## Step 3: Create a New API Key

1. Click **"+ Create API Key"** or **"New Key"**
2. Give it a name (e.g., `chat-app-key`)
3. Click **"Create"** or **"Generate"**
4. Your API key will appear (looks like a long random string)

---

## Step 4: Copy Your API Key

⚠️ **IMPORTANT:** 
- Copy and save this key somewhere safe
- You won't be able to see it again after closing
- If you lose it, create a new one

Your key looks like:
```
gsk_1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p
```

---

## Step 5: Add to Your .env File

1. Open `Backend/.env`
2. Find the line with `GROQ_API_KEY`
3. Replace with your actual key:

```
GROQ_API_KEY=gsk_1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p
```

4. Save the file

---

## Step 6: Test the API Key

1. Restart your backend:
```bash
npm run dev
```

2. Test by sending a message in your chat app
3. If it works, you'll get AI responses
4. If it fails, check:
   - API key is correct
   - No extra spaces or characters
   - Your account has API access enabled

---

## Groq API Models Available

Your Chat App uses: **`llama-3.1-8b-instant`**

Other available models:
- `llama-3.1-70b-versatile` (more powerful, slower)
- `llama-3.2-90b-vision-preview` (with vision capabilities)
- `mixtral-8x7b-32768` (high quality)

To change models, edit `Backend/src/sockets/services/ai.service.js`

---

## Understanding Groq

**What is Groq?**
- Fast LLM inference platform
- Provides API access to powerful language models
- Free tier available for development

**Why Groq instead of OpenAI?**
- ✅ Faster inference (25-40% faster)
- ✅ Cheaper (or free for testing)
- ✅ No credit card required for signup
- ✅ Generous free tier

**Pricing:**
- Free tier: Limited requests per day
- Paid tiers: Pay per token used
- Current plan shows in Console

---

## Check Your API Key Status

1. Go to https://console.groq.com
2. Click **"API Keys"**
3. Your key status should show **"Active"**
4. You can:
   - ✏️ Rename the key
   - 🔄 Regenerate (creates new key, old one stops working)
   - 🗑️ Delete the key

---

## For Deployment

When deploying to Render/Railway/Heroku:

1. **Do NOT** commit your .env file to Git
2. Copy your API key (keep it safe!)
3. Go to your deployment platform
4. Add environment variable:
   - **Key:** `GROQ_API_KEY`
   - **Value:** Your API key
5. Deploy

---

## Troubleshooting

### ❌ "Invalid API key"
- **Solution:** Copy key again exactly as shown
- No extra spaces before/after
- Check for typos

### ❌ "API rate limit exceeded"
- **Solution:** Free tier has limits
- Wait a few hours
- Upgrade to paid tier for more requests
- Check usage in console

### ❌ "API key not working after deployment"
- **Solution:** Verify key is set in deployment platform's env vars
- Check logs for actual error
- Try regenerating a new key

### ❌ "No response from AI"
- **Solution:** Check Groq status page
- Verify API key in backend logs
- Test locally first

---

## Quick Reference

| Item | Example |
|------|---------|
| API Key Format | `gsk_xxxxxxxxxxxxxxxxxxxxx` |
| Default Model | `llama-3.1-8b-instant` |
| Console URL | https://console.groq.com |
| Docs | https://console.groq.com/docs |
| Status Page | https://status.groq.com |

---

## Next Steps

After getting your API key:

1. ✅ Add it to `Backend/.env` as `GROQ_API_KEY`
2. ✅ Test locally (send a message in chat)
3. ✅ Verify AI responds correctly
4. ✅ Commit to GitHub (without .env file!)
5. ✅ Add key to deployment platform's env vars
6. ✅ Deploy and test in production

---

## Security Notes

🔒 **Keep Your API Key Safe:**
- ❌ Never share publicly
- ❌ Never commit to Git
- ❌ Never post in support forums
- ❌ Don't include in code comments
- ✅ Use environment variables
- ✅ Regenerate if accidentally exposed
- ✅ Check API key usage regularly

---

**Need help?**
- Groq Docs: https://console.groq.com/docs
- Groq Status: https://status.groq.com
- Check your console for API usage and limits
