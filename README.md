# HireMate - Job Marketplace Platform

![HireMate Logo](https://raw.githubusercontent.com/sagar-coder29/Hiremate/main/static/images/logo.png)

A modern, visually stunning job marketplace platform where customers can find and hire skilled workers for various services.

---

## 🚀 Features

### Core Features
- **User Authentication** - Secure login/registration for customers and workers with social auth support (Google)
- **Worker Discovery** - Browse and search through verified service providers with filtering
- **Booking System** - Easy booking with date/time selection and status tracking
- **Rating & Reviews** - Rate workers after completed services (1-5 stars)
- **User Profiles** - Separate profiles for customers and workers

### UI/UX Features
- **Responsive Design** - Works seamlessly on all devices
- **3D Animated UI** - Immersive hero section with floating shapes, cubes, and particles
- **Real-time Stats** - Animated counters and live statistics dashboard
- **Interactive Charts** - Chart.js powered bar charts for monthly bookings with YoY comparison
- **Modern Components** - Shadcn-style UI components with Tailwind CSS

### Services Available
- Electrician
- Plumber
- Carpenter
- Painter
- Cleaner
- Mechanic
- Gardener
- AC Repair

---

## 📊 Analytics Dashboard

The home page features an analytics section with:
- **Service Distribution** - Pie/Doughnut chart showing popular services
- **Monthly Bookings** - Bar chart comparing bookings month-over-month (Last Year vs This Year)
- **Customer Satisfaction** - Circular progress indicator with satisfaction rate
- **Live Statistics** - Animated counters for customers, workers, jobs completed

---

## 📸 Screenshots

> **Note:** Screenshots will be added after deployment. To add your own screenshots:
> 1. Take screenshots of each page
> 2. Save them as PNG files in `static/images/screenshots/`
> 3. Update the image paths below

### Home Page
![Home Page](https://via.placeholder.com/1200x600/2563eb/ffffff?text=HireMate+Home+Page)
*Modern hero section with 3D animated background and analytics charts*

### Login Page
![Login](https://via.placeholder.com/800x500/1d4ed8/ffffff?text=Login+Page)
*Clean and intuitive authentication interface with social login*

### Worker List
![Workers](https://via.placeholder.com/1200x600/2563eb/ffffff?text=Worker+Listing+Page)
*Browse and filter service providers by service type, location, price, and rating*

### Worker Profile
![Profile](https://via.placeholder.com/800x600/1d4ed8/ffffff?text=Worker+Profile)
*Detailed worker profiles with ratings, services, and availability*

### Dashboard
![Dashboard](https://via.placeholder.com/1200x600/2563eb/ffffff?text=User+Dashboard)
*Personalized dashboard with booking management and status badges*

### Booking Flow
![Booking](https://via.placeholder.com/800x500/1d4ed8/ffffff?text=Booking+Page)
*Simple and intuitive booking process with date/time picker*

---

## 🛠️ Tech Stack

### Backend
- **Framework:** Django 4.2
- **Database:** SQLite (development), PostgreSQL (production)
- **Authentication:** Django Auth + Social Auth (Google OAuth)

### Frontend
- **HTML5, CSS3, JavaScript** - Core web technologies
- **Tailwind CSS** - Utility-first CSS framework
- **Chart.js** - Interactive charts and data visualization
- **Font Awesome 6** - Icon library
- **Google Fonts** - Inter font family

### Future Stack (Next.js App)
- **Framework:** Next.js 16
- **UI Components:** shadcn/ui style components
- **Icons:** Remix Icon
- **State:** React hooks

### Hosting
- **PythonAnywhere** - Primary hosting
- **Railway** - Alternative deployment
- **Render** - Cloud hosting option

---

## ⚙️ Installation

### Prerequisites
- Python 3.10+
- pip
- Git

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

### Next.js App Setup (Optional)

```bash
cd next-app
npm install
npm run dev
```

---

## 🌐 Live Demo

**Live URL:** https://your-username.pythonanywhere.com

*(Replace with your deployed URL)*

---

## 📁 Project Structure

```
Hiremate/
├── accounts/              # User authentication, registration & profiles
│   ├── models.py          # Custom user models
│   ├── views.py           # Auth views and dashboard
│   ├── urls.py            # Auth URLs
│   └── pipeline.py        # Social auth pipeline
├── bookings/              # Booking management system
│   ├── models.py          # Booking model
│   ├── views.py           # Booking CRUD views
│   └── urls.py            # Booking URLs
├── profiles/              # Worker & customer profiles
│   ├── models.py          # Profile models
│   ├── views.py           # Profile views
│   └── urls.py            # Profile URLs
├── ratings/               # Ratings and reviews system
│   ├── models.py          # Rating model
│   └── views.py           # Rating views
├── hiremate/              # Django project settings
│   ├── settings.py        # Project configuration
│   ├── urls.py            # Root URL configuration
│   └── wsgi.py            # WSGI application
├── next-app/              # Next.js application (future frontend)
│   ├── app/               # Next.js app router
│   ├── components/        # React components
│   ├── lib/               # Utilities
│   └── hooks/             # Custom React hooks
├── static/                # Static assets
│   ├── css/
│   │   ├── style.css      # Main stylesheet
│   │   ├── components.css # UI components
│   │   └── shadcn.css     # Shadcn-style components
│   ├── js/
│   │   └── main.js        # JavaScript functionality
│   └── images/            # Images and logos
├── templates/             # HTML templates
│   ├── base.html          # Base template
│   ├── home.html          # Home page with analytics
│   ├── accounts/          # Auth templates
│   ├── bookings/          # Booking templates
│   ├── profiles/          # Profile templates
│   ├── ratings/           # Rating templates
│   └── components/        # Reusable components
├── manage.py
├── requirements.txt
├── tailwind.config.js     # Tailwind CSS configuration
└── README.md
```

---

## 🔐 Demo Credentials

### Customer Account
- **Email:** demo_customer / customer@example.com
- **Password:** demo1234

### Worker Account
- **Email:** demo_worker / worker@example.com
- **Password:** demo1234

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

### Services
Add new services in `profiles/models.py`:
```python
SERVICE_CHOICES = [
    ('electrician', 'Electrician'),
    ('plumber', 'Plumber'),
    # Add new services here
]
```

### Charts
Modify chart data in `templates/home.html`:
```javascript
const lastYearData = [180, 220, 280, ...];
const thisYearData = [240, 310, 380, ...];
```

### Logo
Replace `static/images/logo.png` with your custom logo.

---

## 📝 Recent Updates

### v2.0 (March 2026)
- Added **Chart.js** for data visualization
- Implemented **Monthly Bookings** bar chart with year-over-year comparison
- Added **Service Distribution** doughnut chart
- Created **Customer Satisfaction** circular progress indicator
- Added **Live Statistics** with animated counters
- Integrated **Google OAuth** social authentication
- Added **Shadcn-style UI components**
- Set up **Next.js** app structure for future frontend

### v1.0 (Initial Release)
- User authentication system
- Worker listing and profiles
- Booking management
- Rating system
- Responsive design with 3D animations

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
- [Chart.js](https://www.chartjs.org/) for data visualization
- [Tailwind CSS](https://tailwindcss.com) for styling
- [shadcn/ui](https://ui.shadcn.com/) for UI inspiration

---

⭐ If you found this project useful, please give it a star!
