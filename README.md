# 🎬 CaptionAI Pro

> AI-powered video captioning agent — paste a YouTube link or upload a local video and get captions in **Punjabi, Hindi, English, Urdu** and 50+ languages. Exports directly for **Adobe Premiere Pro**.

---

## ✨ Features

- 🔗 **YouTube link** → auto-fetch title + generate captions
- 📁 **Local video upload** → drag & drop MP4, MOV, AVI, MKV
- 🌐 **50+ languages** — Punjabi (ਪੰਜਾਬੀ), Hindi (हिंदी), Urdu, English, Spanish, French...
- ⏱ **Full timestamps** — start → end per segment, SRT format preview
- 📊 **Visual timeline** — click any segment to jump to it
- 🎞 **Adobe Premiere Pro export** — download SRT + step-by-step guide
- 🔒 **Safe backend** — your API key never exposed to users

---

## 🗂 Project Structure

```
caption-ai-pro/
├── public/
│   └── index.html       ← Frontend (the full app UI)
├── server.js            ← Node.js backend (keeps API key safe)
├── package.json
├── .env.example         ← Copy this to .env and add your key
├── .gitignore           ← Keeps .env out of GitHub
└── README.md
```

---

## 🚀 Deploy to GitHub + Render (Free)

### Step 1 — Get Your Anthropic API Key

1. Go to **[console.anthropic.com](https://console.anthropic.com)**
2. Sign up / log in → click **"API Keys"**
3. Click **"Create Key"** → copy it somewhere safe

---

### Step 2 — Push to GitHub

1. Go to **[github.com](https://github.com)** → sign in → click **"New repository"**
2. Name it: `caption-ai-pro`
3. Set to **Public** → click **"Create repository"**
4. On your computer, open **Terminal** (Mac/Linux) or **Git Bash** (Windows)
5. Run these commands one by one:

```bash
# Navigate to your project folder
cd caption-ai-pro

# Initialize git
git init

# Add all files
git add .

# First commit
git commit -m "🚀 Initial deploy — CaptionAI Pro"

# Connect to your GitHub repo (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/caption-ai-pro.git

# Push to GitHub
git branch -M main
git push -u origin main
```

✅ Your code is now on GitHub!

---

### Step 3 — Deploy Backend on Render (Free Hosting)

Render hosts your Node.js server for free.

1. Go to **[render.com](https://render.com)** → sign up with GitHub
2. Click **"New +"** → select **"Web Service"**
3. Click **"Connect a repository"** → select `caption-ai-pro`
4. Fill in these settings:

| Field | Value |
|-------|-------|
| **Name** | `caption-ai-pro` |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `node server.js` |
| **Plan** | Free |

5. Scroll down to **"Environment Variables"** → click **"Add Environment Variable"**:

| Key | Value |
|-----|-------|
| `ANTHROPIC_API_KEY` | `your_actual_api_key_here` |

6. Click **"Create Web Service"**
7. Wait 2–3 minutes → Render gives you a URL like:
   `https://caption-ai-pro.onrender.com`

✅ **Your app is live!** Share that URL with anyone.

---

## 💻 Run Locally (Development)

```bash
# 1. Clone your repo
git clone https://github.com/YOUR_USERNAME/caption-ai-pro.git
cd caption-ai-pro

# 2. Install dependencies
npm install

# 3. Create your .env file
cp .env.example .env
# Now open .env and add your ANTHROPIC_API_KEY

# 4. Start the server
npm start

# 5. Open in browser
# Go to: http://localhost:3000
```

---

## 🔄 Update Your App Later

Whenever you make changes to the code:

```bash
git add .
git commit -m "✏️ Updated captions UI"
git push
```

Render automatically redeploys within 1–2 minutes. ✅

---

## 🛡 Security Notes

- ✅ API key stored in Render's environment variables — not in code
- ✅ `.env` file is in `.gitignore` — never pushed to GitHub
- ✅ Frontend calls `/api/generate-captions` on your own server
- ✅ Users never see your Anthropic API key

---

## 🌐 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML, CSS, JavaScript |
| Backend | Node.js + Express |
| AI | Anthropic Claude API |
| Hosting | Render (free tier) |
| Repo | GitHub |

---

## 📞 Need Help?

If something breaks:
1. Check Render logs: Dashboard → Your service → **"Logs"** tab
2. Make sure `ANTHROPIC_API_KEY` is set in Render environment variables
3. Make sure your Anthropic account has credits

---

*Built with ❤️ by Simardeep · Powered by Claude AI*
