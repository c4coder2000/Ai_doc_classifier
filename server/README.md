# Document Classifier API Server

A FastAPI backend for AI-powered document classification with Supabase PostgreSQL integration.

## 🏗️ Project Structure

```
server/
├── main.py                 # FastAPI application entry point
├── config.py              # Centralized application configuration
├── database.py            # SQLAlchemy database setup
├── models.py              # Database models (Document)
├── schemas.py             # Pydantic schemas for API validation
├── crud.py                # Database operations (CRUD)
├── init_db.py             # Database initialization script
├── start_server.py        # Server startup script
├── requirements.txt       # Python dependencies
├── .env                   # Environment configuration
│
├── routers/               # API route handlers
│   ├── __init__.py
│   ├── classify.py        # Document classification endpoints
│   └── history.py         # Classification history endpoints
│
├── middleware/            # FastAPI middleware
│   ├── __init__.py
│   └── cors.py           # CORS and security middleware
│
├── utils/                 # Utility modules
│   ├── __init__.py
│   ├── file_ops.py       # File handling operations
│   ├── timeout.py        # Timeout management
│   └── helpers.py        # Helper functions
│
├── model/                 # ML model and classifier
│   └── classifier.py     # Document classification logic
│
└── temp/                  # Temporary file storage
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Configure Environment

Update `.env` file with your Supabase PostgreSQL connection:

```env
DATABASE_URL=postgresql://username:password@host:port/database
MODEL_PATH=./model/your_model.pth
```

### 3. Initialize Database

```bash
python init_db.py
```

### 4. Start Server

```bash
python start_server.py
```

Or use the traditional method:

```bash
python main.py
```

The API will be available at `http://localhost:8000`

## 📚 API Documentation

- **Interactive Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🛣️ API Endpoints

### Classification

- `POST /api/v1/classify` - Classify a document
- `GET /api/v1/health` - Health check
- `POST /api/v1/cleanup` - Clean up temporary files

### History Management

- `GET /api/v1/history` - Get classification history (paginated)
- `GET /api/v1/history/recent` - Get recent classifications
- `GET /api/v1/history/by-label/{label}` - Get classifications by label
- `GET /api/v1/history/{document_id}` - Get specific classification
- `DELETE /api/v1/history/{document_id}` - Delete classification
- `GET /api/v1/stats` - Get classification statistics

## 🔧 Configuration

The application uses `config.py` for centralized configuration management. Key settings:

- **Server**: Host, port, debug mode
- **Database**: Connection URL and pool settings
- **File Upload**: Size limits, allowed extensions
- **Timeouts**: OCR, LLM, and general operation timeouts
- **CORS**: Allowed origins, methods, headers

## 🗄️ Database Schema

### Document Model

```sql
CREATE TABLE documents (
    id UUID PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    label VARCHAR(100) NOT NULL,
    confidence FLOAT NOT NULL,
    override_reason VARCHAR(255),
    disagreement BOOLEAN DEFAULT FALSE,
    summary TEXT,
    raw_text TEXT,
    user_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
);
```

## 🔒 Security Features

- CORS middleware with configurable origins
- Security headers (X-Content-Type-Options, X-Frame-Options, etc.)
- Request logging and timing
- File upload validation and size limits
- Timeout protection for long-running operations

## 📦 Key Dependencies

- **FastAPI**: Modern, fast web framework
- **SQLAlchemy**: Database ORM
- **Pydantic**: Data validation
- **psycopg2-binary**: PostgreSQL adapter
- **PyTorch**: Machine learning framework
- **pytesseract**: OCR capabilities

## 🚨 Error Handling

The API provides comprehensive error handling with:

- Detailed error messages
- Proper HTTP status codes
- Request logging
- Timeout protection
- Database transaction rollback

## 🔄 Development Workflow

1. **Start Development Server**:

   ```bash
   python start_server.py
   ```

2. **Run Database Migrations**:

   ```bash
   python init_db.py
   ```

3. **Test API Endpoints**:
   Visit http://localhost:8000/docs for interactive testing

4. **Monitor Logs**:
   All operations are logged with appropriate levels

## 🐳 Production Deployment

For production deployment:

1. Update `.env` with production settings
2. Set `DEBUG=False`
3. Configure proper CORS origins
4. Use a production WSGI server like Gunicorn
5. Set up proper logging and monitoring

## 📞 API Usage Examples

### Classify Document

```python
import requests

with open('document.pdf', 'rb') as f:
    response = requests.post(
        'http://localhost:8000/api/v1/classify',
        files={'file': f}
    )
    result = response.json()
```

### Get Classification History

```python
response = requests.get(
    'http://localhost:8000/api/v1/history',
    params={'page': 1, 'per_page': 20}
)
history = response.json()
```

## 🤝 Contributing

1. Follow the established project structure
2. Add appropriate error handling
3. Include logging for debugging
4. Update this README for new features
5. Test all endpoints before committing

## 📝 License

This project is part of the Slate Intelligence Document Classifier application.
