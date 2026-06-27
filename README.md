# MiniRAG - Document Analysis with AI

A modern web application that allows you to upload PDF documents and ask questions about them using AI-powered retrieval-augmented generation (RAG).

## Features

- **PDF Upload & Processing**: Upload multiple PDF documents with automatic text extraction and chunking
- **AI-Powered Q&A**: Ask questions about your documents and get intelligent answers
- **Conversation Memory**: The AI remembers context from previous messages in the conversation
- **PDF Viewer**: View your uploaded PDFs directly in the application
- **Document Management**: Organize and manage your document library
- **Real-time Chat**: Interactive chat interface with message history
- **Semantic Search**: Uses embeddings to find the most relevant document chunks

## Tech Stack

### Frontend
- React 18
- Framer Motion (animations)
- Lucide React (icons)
- Axios (API client)

### Backend
- Node.js with Express
- MongoDB (database)
- Groq API (AI inference - Llama 3.3 70B)
- Google Generative AI (embeddings - optional)
- pdf-parse (PDF text extraction)

## Prerequisites

Before running this application, ensure you have installed:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** (v6 or higher) - [Download here](https://www.mongodb.com/try/download/community)
- **Git** (for cloning) - [Download here](https://git-scm.com/downloads)

## Installation

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd minirag
```

### 2. Install Dependencies

Install server dependencies:
```bash
cd server
npm install
```

Install client dependencies:
```bash
cd ../client
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the `server` directory:

```bash
cd server
```

Create `server/.env` with the following content:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/smart-rag-db

# Groq API Key (Required for AI responses)
# Get your key from: https://console.groq.com/
GROQ_API_KEY=your_groq_api_key_here

# Google API Key (Optional - for better embeddings)
# Get your key from: https://makersuite.google.com/app/apikey
GOOGLE_API_KEY=your_google_api_key_here

# Server Port
PORT=5000
```

**Important**: Replace `your_groq_api_key_here` with your actual Groq API key. Without this, the app will use fallback responses with limited intelligence.

### 4. Start MongoDB

Make sure MongoDB is running on your system:

**Windows:**
```bash
# If installed as a service, it starts automatically
# Or run manually:
mongod
```

**Mac/Linux:**
```bash
sudo systemctl start mongod
# or
mongod
```

### 5. Run the Application

**Terminal 1 - Start the Server:**
```bash
cd server
npm run dev
```

**Terminal 2 - Start the Client:**
```bash
cd client
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Deployment on Other PCs

### Option 1: Manual Setup

1. **Copy the Project Files**
   - Zip the entire `minirag` folder
   - Transfer it to the target PC
   - Extract the folder

2. **Install Prerequisites**
   - Install Node.js on the target PC
   - Install MongoDB on the target PC
   - Start MongoDB service

3. **Install Dependencies**
   ```bash
   cd minirag/server
   npm install
   cd ../client
   npm install
   ```

4. **Configure Environment Variables**
   - Create `server/.env` file
   - Add the required API keys
   - Adjust MongoDB URI if needed

5. **Run the Application**
   - Open two terminal windows
   - Start server: `cd server && npm run dev`
   - Start client: `cd client && npm start`

### Option 2: Build for Production

**Build the React Client:**
```bash
cd client
npm run build
```

This creates a `build` folder in the client directory.

**Serve with Express (Server-side):**

Update `server/src/index.js` to serve static files:

```javascript
const path = require('path');

// Add this after your existing middleware
app.use(express.static(path.join(__dirname, '../../client/build')));

// Add this as the last route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../client/build', 'index.html'));
});
```

Then run only the server:
```bash
cd server
npm start
```

Access the app at: http://localhost:5000

### Option 3: Cloud Deployment

**Deploy to Vercel (Frontend) + Render/Railway (Backend):**

1. **Frontend (Vercel):**
   - Push code to GitHub
   - Import project in Vercel
   - Set root directory to `client`
   - Deploy

2. **Backend (Render/Railway):**
   - Import project in Render/Railway
   - Set root directory to `server`
   - Add environment variables in the dashboard
   - Deploy

3. **MongoDB:**
   - Use MongoDB Atlas (free tier)
   - Update `MONGODB_URI` in environment variables

## Environment Variables Guide

| Variable | Required | Description | Where to Get |
|----------|----------|-------------|-------------|
| `MONGODB_URI` | Yes | MongoDB connection string | Local: `mongodb://localhost:27017/smart-rag-db`<br>Cloud: MongoDB Atlas |
| `GROQ_API_KEY` | Yes | Groq API key for AI responses | https://console.groq.com/ |
| `GOOGLE_API_KEY` | No | Google API key for embeddings | https://makersuite.google.com/app/apikey |
| `PORT` | No | Server port (default: 5000) | Your choice |

## Usage

1. **Register/Login**: Create an account or log in
2. **Upload PDF**: Go to Dashboard and upload a PDF document
3. **Wait for Processing**: The PDF will be processed (text extraction + chunking)
4. **Ask Questions**: Go to Chat, select a document, and ask questions
5. **View PDF**: Click the eye icon on any processed PDF to view it

## Troubleshooting

### "MongoDB Connection Failed"
- Ensure MongoDB is running
- Check if MongoDB is on the correct port (27017)
- Verify `MONGODB_URI` in `.env` file

### "Google embedding failed" errors
- These are warnings, not errors
- The app uses fallback embeddings if Google API key is not configured
- Add `GOOGLE_API_KEY` to `.env` for better semantic search

### "AI doesn't remember previous messages"
- Ensure `GROQ_API_KEY` is set in `.env`
- Restart the server after adding the API key
- Without the key, fallback responses don't have memory

### "PDF not displaying"
- Ensure you're logged in
- Check browser console for authentication errors
- The PDF viewer requires authentication

### "Port 5000 already in use"
- Kill the process using the port:
  ```bash
  # Windows
  netstat -ano | findstr :5000
  taskkill /PID <PID> /F
  
  # Mac/Linux
  lsof -ti:5000 | xargs kill -9
  ```
- Or change the `PORT` in `.env`

### "npm install fails"
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again
- Ensure you're using Node.js v16 or higher

## Project Structure

```
minirag/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── api/           # API calls
│   │   ├── components/    # React components
│   │   ├── contexts/      # React contexts
│   │   └── pages/         # Page components
│   └── package.json
├── server/                # Express backend
│   ├── src/
│   │   ├── middleware/    # Auth, upload middleware
│   │   ├── models/        # Mongoose models
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   └── utils/         # Utility functions
│   ├── uploads/           # Uploaded PDFs
│   └── package.json
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### PDFs
- `POST /api/pdfs/upload` - Upload PDF
- `GET /api/pdfs` - Get all PDFs
- `GET /api/pdfs/:id` - Get single PDF
- `GET /api/pdfs/:id/view` - View PDF file
- `DELETE /api/pdfs/:id` - Delete PDF

### Chats
- `GET /api/chats` - Get all chats
- `GET /api/chats/:id` - Get single chat
- `POST /api/chats` - Create chat
- `PUT /api/chats/:id` - Update chat
- `DELETE /api/chats/:id` - Delete chat
- `POST /api/chats/:id/messages` - Add message
- `PUT /api/chats/:id/messages/:messageId` - Edit message

### Chat Query
- `POST /api/chat/query` - Ask question about documents

## License

MIT

## Support

For issues or questions, please open an issue on GitHub or contact the development team.
