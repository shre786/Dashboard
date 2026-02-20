 
￼
# Quick Start Guide

## Starting the Backend Server

### Option 1: Using the startup script (Recommended)
```bash
cd /home/computervision2/Documents/Dashboard/Dashboard/backend/dashboard
./start_server.sh
```

### Option 2: Manual start
```bash
cd /home/computervision2/Documents/Dashboard/Dashboard
source env/bin/activate
cd backend/dashboard
python manage.py runserver 0.0.0.0:8000
```

## Testing the API

### Quick Test
```bash
# Test forgot password endpoint
curl -X POST http://localhost:8000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

### Run Full Test Suite
```bash
python test_api.py
```

## Create Admin User

```bash
python manage.py createsuperuser
```

Then access admin panel at: http://localhost:8000/admin/

## Import CSV Data

```bash
python manage.py import_csv path/to/csvfile.csv
```

## Common Commands

```bash
# Make migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run tests
python manage.py test

# Collect static files (for production)
python manage.py collectstatic
```

## API Endpoints Summary

**Authentication (No auth required):**
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login user
- POST `/api/auth/forgot-password` - Request password reset

**Companies (Auth required - Bearer token):**
- POST `/api/companies` - Create company
- GET `/api/companies/` - List companies
- PUT `/api/companies/{id}` - Update company
- PATCH `/api/companies/{id}/status` - Update status
- GET `/api/companies/upcoming-meetings` - Upcoming meetings
- GET `/api/companies/updates` - Next week meetings

## Environment

- Python: 3.10
- Django: 5.2.11
- DRF: 3.16.1
- Database: PostgreSQL
- Virtual env: Located at `../../env/`

## Troubleshooting

**Port already in use:**
```bash
# Find process using port 8000
lsof -ti:8000

# Kill process
kill -9 $(lsof -ti:8000)
```

**Database connection error:**
- Check PostgreSQL is running: `sudo systemctl status postgresql`
- Verify credentials in `dashboard/settings.py`

**Module not found:**
```bash
source ../../env/bin/activate
pip install -r requirements.txt
```

## Next Steps

1. ✅ Backend is running
2. 🔧 Configure frontend to use `http://localhost:8000/api/`
3. 🔐 Implement JWT token storage in frontend
4. 📊 Create API service layer in frontend
5. 🎨 Connect frontend components to API endpoints

---

**Server Status:** The server should now be running at http://localhost:8000

**API Base URL:** http://localhost:8000/api/

**Admin Panel:** http://localhost:8000/admin/
