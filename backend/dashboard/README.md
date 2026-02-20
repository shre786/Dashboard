# Dashboard Backend API

Django REST Framework backend for the Dashboard application with JWT authentication.

## Setup Instructions

### 1. Prerequisites
- Python 3.10+
- PostgreSQL database
- Virtual environment (already included in `env/` directory)

### 2. Installation

Activate the virtual environment:
```bash
source ../../env/bin/activate  # from backend/dashboard directory
```

Install dependencies:
```bash
pip install -r requirements.txt
```

### 3. Database Configuration

The project is configured to use PostgreSQL. Update database settings in `dashboard/settings.py` if needed:

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'dashboard',   
        'USER': 'vgt_admin',
        'PASSWORD': 'portaldb123',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

### 4. Run Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### 5. Create Superuser (Optional)

```bash
python manage.py createsuperuser
```

### 6. Import CSV Data (Optional)

```bash
python manage.py import_csv path/to/your/csvfile.csv
```

### 7. Run Development Server

```bash
python manage.py runserver 0.0.0.0:8000
```

The API will be available at `http://localhost:8000/api/`

## API Endpoints

### Authentication

#### 1. Register User
- **URL:** `POST /api/auth/register`
- **Auth:** None
- **Body:**
```json
{
  "email": "john@example.com",
  "password": "StrongP@ss123",
  "password_confirm": "StrongP@ss123",
  "first_name": "John",
  "last_name": "Doe",
  "user_name": "john_doe"
}
```

#### 2. Login
- **URL:** `POST /api/auth/login`
- **Auth:** None
- **Body:**
```json
{
  "username": "john@example.com",
  "password": "StrongP@ss123"
}
```

#### 3. Forgot Password
- **URL:** `POST /api/auth/forgot-password`
- **Auth:** None
- **Body:**
```json
{
  "email": "john@example.com"
}
```

### Company Management

All company endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_access_token>
```

#### 1. Create Company
- **URL:** `POST /api/companies`
- **Auth:** Required
- **Body:**
```json
{
  "CompanyName": "ABC Pvt Ltd",
  "domain": "abc.com",
  "website": "https://abc.com",
  "poc": "John Doe",
  "email": "john@abc.com",
  "phone": "+919876543210",
  "status": "Under Progress",
  "meetingAvailability": "Next Week",
  "meetingDate": "2026-02-25T10:30:00Z"
}
```

#### 2. List Companies
- **URL:** `GET /api/companies/`
- **Auth:** Required
- **Query Params:** `?page=1&page_size=10`

#### 3. Update Company
- **URL:** `PUT /api/companies/{id}`
- **Auth:** Required
- **Body:** (partial updates allowed)
```json
{
  "quotes": "Updated quotation text",
  "status": "Interested"
}
```

#### 4. Update Company Status
- **URL:** `PATCH /api/companies/{id}/status`
- **Auth:** Required
- **Body:**
```json
{
  "status": "Skip"
}
```

Valid status values: `Under Progress`, `Interested`, `Awaiting for Meeting`, `Quotation`, `Skip`

#### 5. Upcoming Meetings
- **URL:** `GET /api/companies/upcoming-meetings`
- **Auth:** Required
- **Query Params:** `?limit=3` (optional)

#### 6. Next Week Updates
- **URL:** `GET /api/companies/updates`
- **Auth:** Required

## Project Structure

```
backend/dashboard/
├── core/                          # Main application
│   ├── management/
│   │   └── commands/
│   │       └── import_csv.py     # CSV import command
│   ├── migrations/               # Database migrations
│   ├── models.py                 # User and Company models
│   ├── serializers.py            # DRF serializers
│   ├── views.py                  # API views
│   ├── urls.py                   # App URL configuration
│   └── admin.py                  # Django admin configuration
├── dashboard/                    # Project settings
│   ├── settings.py              # Main settings
│   ├── urls.py                  # Root URL configuration
│   └── wsgi.py                  # WSGI configuration
├── manage.py                    # Django management script
└── requirements.txt             # Python dependencies
```

## Key Features

1. **JWT Authentication**: Secure token-based authentication using SimpleJWT
2. **CORS Support**: Configured for frontend integration
3. **Custom User Model**: Extended Django user model with additional fields
4. **Company Management**: Full CRUD operations for company data
5. **Meeting Management**: Track upcoming meetings and updates
6. **CSV Import**: Custom management command for bulk data import
7. **PostgreSQL Database**: Production-ready database configuration

## Configuration

### CORS Settings
Frontend URLs are allowed in `settings.py`:
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
```

### JWT Token Lifetime
- Access Token: 1 hour
- Refresh Token: 1 day

Configure in `settings.py` under `SIMPLE_JWT` settings.

## Testing the API

You can test the API using:
1. **Postman/Insomnia**: Import the endpoints and test
2. **curl**: Command-line testing
3. **Django Admin**: Available at `http://localhost:8000/admin/`

Example curl request:
```bash
# Register
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test@123","password_confirm":"Test@123","first_name":"Test","last_name":"User","user_name":"testuser"}'

# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test@example.com","password":"Test@123"}'
```

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Verify database credentials in settings.py
- Check if database exists: `psql -l`

### Migration Issues
- Delete migrations: `find . -path "*/migrations/*.py" -not -name "__init__.py" -delete`
- Recreate: `python manage.py makemigrations && python manage.py migrate`

### Import Errors
- Activate virtual environment first
- Install all requirements: `pip install -r requirements.txt`

## Production Deployment

For production deployment:
1. Set `DEBUG = False` in settings.py
2. Configure `ALLOWED_HOSTS`
3. Use a production WSGI server (gunicorn/uWSGI)
4. Set up proper PostgreSQL credentials
5. Configure static files serving
6. Use environment variables for sensitive data

## License

This project is proprietary and confidential.
