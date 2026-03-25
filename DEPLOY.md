# HireMate Deployment Guide

## Railway Deployment (Recommended - Free Tier)

### Prerequisites
1. Install Railway CLI: `npm install -g @railway/cli`
2. Login: `railway login`

### Deploy Steps

1. **Initialize Railway project:**
   ```bash
   railway init
   ```

2. **Add SQLite database:**
   - Go to your Railway dashboard
   - Click on your project
   - Add a plugin → PostgreSQL (or use SQLite locally)

3. **Set Environment Variables:**
   ```bash
   railway variables set DJANGO_SECRET_KEY=your-secret-key-here
   railway variables set DEBUG=False
   railway variables set ALLOWED_HOSTS=your-app-name.up.railway.app
   ```

4. **Deploy:**
   ```bash
   railway up
   ```

5. **Run migrations:**
   ```bash
   railway run python manage.py migrate
   ```

6. **Create superuser (optional):**
   ```bash
   railway run python manage.py createsuperuser
   ```

7. **Collect static files:**
   ```bash
   railway run python manage.py collectstatic
   ```

## Render Deployment (Alternative - Free Tier)

1. Create account at [render.com](https://render.com)
2. Connect your GitHub repository
3. Create a new Web Service
4. Set build command: `pip install -r requirements.txt`
5. Set start command: `gunicorn hiremate.wsgi --bind 0.0.0.0:$PORT`
6. Add environment variables in dashboard

## PythonAnywhere Deployment

1. Create account at [pythonanywhere.com](https://pythonanywhere.com)
2. Open Bash console
3. Clone your repo: `git clone https://github.com/your-repo/hiremate.git`
4. Create virtualenv and install requirements
5. Configure WSGI file
6. Reload web app

## Local Testing

```bash
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```
