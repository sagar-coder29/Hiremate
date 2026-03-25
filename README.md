# HireMate - Job Marketplace Platform

![HireMate Logo](https://raw.githubusercontent.com/sagar-coder29/Hiremate/main/static/images/logo.png)

A modern, visually stunning job marketplace platform where customers can find and hire skilled workers for various services.

---

## 🚀 Features

- **User Authentication** - Secure login/registration for customers and workers
- **Worker Discovery** - Browse and search through verified service providers
- **Booking System** - Easy booking with date/time selection
- **Rating & Reviews** - Rate workers after completed services
- **Responsive Design** - Works seamlessly on all devices
- **3D Animated UI** - Immersive hero section with dynamic animations
- **Real-time Stats** - Animated counters and statistics

---

## 📸 Screenshots

> **Note:** Screenshots will be added after deployment. To add your own screenshots:
> 1. Take screenshots of each page
> 2. Save them as PNG files in `static/images/screenshots/`
> 3. Update the image paths below

### Home Page
![Home Page](https://via.placeholder.com/1200x600/2563eb/ffffff?text=HireMate+Home+Page)
*Modern hero section with 3D animated background*

### Login Page
![Login](https://via.placeholder.com/800x500/1d4ed8/ffffff?text=Login+Page)
*Clean and intuitive authentication interface*

### Worker List
![Workers](https://via.placeholder.com/1200x600/2563eb/ffffff?text=Worker+Listing+Page)
*Browse and filter service providers*

### Worker Profile
![Profile](https://via.placeholder.com/800x600/1d4ed8/ffffff?text=Worker+Profile)
*Detailed worker profiles with ratings*

### Dashboard
![Dashboard](https://via.placeholder.com/1200x600/2563eb/ffffff?text=User+Dashboard)
*Personalized dashboard for users*

### Booking Flow
![Booking](https://via.placeholder.com/800x500/1d4ed8/ffffff?text=Booking+Page)
*Simple and intuitive booking process*

---

## 🛠️ Tech Stack

- **Backend:** Django 4.2
- **Frontend:** HTML5, CSS3, JavaScript
- **Database:** SQLite (development)
- **Icons:** Font Awesome 6
- **Fonts:** Google Fonts (Inter)
- **Hosting:** PythonAnywhere / Railway / Render

---

## ⚙️ Installation

### Prerequisites
- Python 3.10+
- pip

### Local Setup

```bash
# Clone the repository
git clone https://github.com/sagar-coder29/Hiremate.git
cd Hiremate

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Seed sample data
python manage.py seed_data

# Start development server
python manage.py runserver
```

Open http://localhost:8000 in your browser.

---

## 🌐 Live Demo

**Live URL:** https://your-username.pythonanywhere.com

*(Replace with your deployed URL)*

---

## 📁 Project Structure

```
Hiremate/
├── accounts/          # User authentication & profiles
├── bookings/          # Booking management
├── profiles/          # Worker profiles
├── ratings/           # Ratings & reviews
├── hiremate/          # Django project settings
├── static/            # CSS, JS, Images
│   ├── css/
│   ├── js/
│   └── images/
├── templates/         # HTML templates
│   ├── accounts/
│   ├── bookings/
│   ├── profiles/
│   └── ratings/
├── manage.py
├── requirements.txt
└── README.md
```

---

## 🔐 Demo Credentials

### Customer Account
- **Email:** customer@example.com
- **Password:** password123

### Worker Account
- **Email:** worker@example.com
- **Password:** password123

### Admin Account
- **Email:** admin@example.com
- **Password:** admin123

---

## 🚀 Deployment

### PythonAnywhere (Recommended)

1. Create account at [pythonanywhere.com](https://pythonanywhere.com)
2. Open Bash console and clone:
   ```bash
   git clone https://github.com/sagar-coder29/Hiremate.git
   ```
3. Create virtualenv and install:
   ```bash
   cd Hiremate
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```
4. Run migrations:
   ```bash
   python manage.py migrate
   ```
5. Configure web app in PythonAnywhere dashboard
6. Set static files path to `/home/username/Hiremate/static`

### Railway

```bash
railway init
railway up
railway run python manage.py migrate
```

---

## 🎨 Customization

### Colors
Edit `static/css/style.css` CSS variables:
```css
:root {
    --primary: #2563eb;
    --primary-dark: #1d4ed8;
    --primary-light: #60a5fa;
    /* ... */
}
```

### Logo
Replace `static/images/logo.png` with your custom logo.

---

## 📝 License

This project is open source and available under the MIT License.

---

## 👨‍💻 Author

**Sagar Kumar Jha**
- GitHub: [@sagar-coder29](https://github.com/sagar-coder29)

---

## 🙏 Acknowledgments

- [Font Awesome](https://fontawesome.com) for icons
- [Google Fonts](https://fonts.google.com) for typography
- [Unsplash](https://unsplash.com) for placeholder images

---

⭐ If you found this project useful, please give it a star!
