#!/bin/bash

# Dashboard Backend Startup Script

echo "======================================"
echo "Starting Dashboard Backend Server"
echo "======================================"
echo ""

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/../.." && pwd )"

# Activate virtual environment
echo "Activating virtual environment..."
source "$PROJECT_ROOT/env/bin/activate"

# Navigate to Django project directory
cd "$SCRIPT_DIR"

echo "Checking database connection..."
python manage.py check --database default

if [ $? -eq 0 ]; then
    echo ""
    echo "✓ Database connection successful"
    echo ""
    echo "Starting development server..."
    echo "API will be available at: http://localhost:8000/api/"
    echo "Admin panel available at: http://localhost:8000/admin/"
    echo ""
    echo "Press CTRL+C to stop the server"
    echo ""
    python manage.py runserver 0.0.0.0:8000
else
    echo ""
    echo "✗ Database connection failed"
    echo "Please check your database configuration in settings.py"
    exit 1
fi
