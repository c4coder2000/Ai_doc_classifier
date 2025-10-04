# 🎯 Slate Intelligence Document Classifier

## Complete Startup Guide

A full-stack AI-powered document classification system with user authentication, built with FastAPI backend and React frontend.

## 🛠️ Prerequisites

- **Python 3.8+** (You have: 3.12.0rc2 ✅)
- **Node.js 16+** (You have: 22.17.0 ✅)
- **PostgreSQL Database** (Supabase configured ✅)

## 🚀 Quick Start (Recommended)

### Option 1: Automated Startup (Windows)

1. **Run the setup script:**
   ```bash
   # Double-click or run:
   start_project.bat
   ```

### Option 2: Manual Startup

#### Step 1: Start Backend Server

```bash
# Navigate to server directory
cd "C:\Users\VICTUS 15\Desktop\react-doc-classifier\server"

# Start FastAPI server
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

#### Step 2: Start Frontend Client (In a new terminal)

```bash
# Navigate to client directory
cd "C:\Users\VICTUS 15\Desktop\react-doc-classifier\client"

# Start React development server
npm start
```

## 🌐 Application URLs

Once both servers are running:

- **Frontend App**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **API Alternative Docs**: http://localhost:8000/redoc

## 🔐 Using the Application

### 1. Sign Up

- Go to http://localhost:3000
- Click "Sign up here"
- Fill in: Full Name, Email, Username, Password
- Click "Create Account"

### 2. Login

- Enter your Username/Email and Password
- Click "Sign In"

### 3. Classify Documents

- Upload PDF, PNG, JPG, JPEG, TIFF, or BMP files
- AI will automatically classify as: Invoice, Receipt, Contract, Resume, Report, etc.
- View confidence scores and detailed results

### 4. View History

- Click "History" in the top navigation
- Search and filter your past classifications
- View all your document processing history

### 5. User Profile

- Click your profile icon in the top right
- View account details
- Sign out when finished

## 🔧 Configuration

### Environment Variables

The project uses these key configurations:

**Backend (.env):**

- `DATABASE_URL`: PostgreSQL connection string
- `SECRET_KEY`: JWT token encryption key
- `ALGORITHM`: JWT algorithm (HS256)

**Frontend:**

- `REACT_APP_API_URL`: Backend API URL (defaults to http://localhost:8000)

## 🎛️ Available Features

✅ **User Authentication**

- JWT-based secure login/signup
- Password hashing and validation
- Session management

✅ **Document Classification**

- AI-powered document type detection
- Support for multiple file formats
- Confidence scoring

✅ **Personal History**

- User-specific document storage
- Search and filtering capabilities
- Classification results tracking

✅ **Modern UI/UX**

- Dark/Light mode toggle
- Responsive design
- Professional styling

## 🛠️ Development Commands

### Backend Commands

```bash
cd server

# Install dependencies
pip install -r requirements.txt

# Run server
python main.py
# OR
uvicorn main:app --reload

# Run with specific host/port
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend Commands

```bash
cd client

# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

## 🐛 Troubleshooting

### Common Issues:

1. **"Module not found" errors**

   ```bash
   # Backend: Install Python dependencies
   cd server && pip install -r requirements.txt

   # Frontend: Install Node dependencies
   cd client && npm install
   ```

2. **Database connection errors**

   - Check your `.env` file has correct `DATABASE_URL`
   - Ensure Supabase database is accessible

3. **Port already in use**

   ```bash
   # Kill processes on ports 3000 or 8000
   netstat -ano | findstr :3000
   netstat -ano | findstr :8000
   # Then kill with: taskkill /PID <PID_NUMBER> /F
   ```

4. **CORS errors**

   - Ensure backend is running on port 8000
   - Check CORS configuration in `server/middleware.py`

5. **Authentication not working**
   - Clear browser localStorage: F12 > Application > Local Storage > Clear
   - Check if JWT SECRET_KEY is set in backend .env

## 📁 Project Structure

```
react-doc-classifier/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── contexts/       # Authentication context
│   │   ├── services/       # API integration
│   │   └── styles/         # CSS styles
│   └── package.json
├── server/                 # FastAPI Backend
│   ├── routers/           # API endpoints
│   ├── models/            # Database models
│   ├── schemas/           # Pydantic schemas
│   ├── utils/             # Utility functions
│   ├── model/             # AI model files
│   └── main.py           # Server entry point
└── README.md
```

## 🎯 Next Steps

After startup, you can:

1. Create your user account
2. Test document classification
3. Explore the history dashboard
4. Try the API documentation at `/docs`

For questions or issues, check the troubleshooting section above.

---

**Happy Classifying! 🚀**
