#!/bin/bash
# PythonAnywhere Deployment Script
# Run this on PythonAnywhere bash console

set -e

echo "🚀 Starting HireMate deployment..."

# Navigate to project directory
cd ~/Hiremate

# Create virtual environment if not exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install --upgrade pip
pip install django gunicorn

# Run migrations
echo "🗄️ Running migrations..."
python manage.py migrate --noinput

# Create sample data
echo "📊 Creating sample data..."
python manage.py seed_data 2>/dev/null || true

# Collect static files
echo "📁 Collecting static files..."
python manage.py collectstatic --noinput

echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Go to Web tab in PythonAnywhere"
echo "2. Click 'Add new web app'"
echo "3. Choose Manual configuration"
echo "4. Set WSGI config file to: /home/YOUR_USERNAME/Hiremate/hiremate/wsgi.py"
echo "5. Add static files: URL=/static/, Path=/home/YOUR_USERNAME/Hiremate/static"
echo "6. Click Reload"
echo ""
echo "🌐 Your site will be live at: https://YOUR_USERNAME.pythonanywhere.com"
