# iRxcruit Backend API

*"Because building your future shouldn't feel like rocket science."*

## Overview

iRxcruit is a comprehensive career platform that connects young talent with job opportunities and training programs. This repository contains the backend API built with FastAPI, featuring a robust architecture with role-based access control, payment processing, email notifications, file storage, and comprehensive user management.

## 🏗️ Architecture

The backend follows a clean architecture pattern with clear separation of concerns:

- **Routers**: Handle HTTP requests and responses
- **Services**: Contain business logic and data processing
- **Models**: Define data structures (Pydantic for API, SQLAlchemy for database)
- **Dependencies**: Manage authentication and shared functionality
- **Database**: SQLite with Alembic migrations

## 🚀 Features

### For Talents
- ✅ Complete profile management (education, work experience, skills, certificates)
- ✅ Job and training browsing with advanced filtering
- ✅ Application tracking and status updates
- ✅ Resume and document upload
- ✅ Email verification and password reset
- ✅ Google OAuth authentication
- ✅ Notification preferences management
- ✅ Saved jobs and trainings
- ✅ Dashboard with personalized recommendations

### For Employers
- ✅ Job posting and management (paid service)
- ✅ Applicant management and tracking
- ✅ Job performance analytics
- ✅ Company profile management
- ✅ Payment processing for job posts
- ✅ File uploads for job images
- ✅ Application status management

### For Trainers
- ✅ Training program posting (paid service)
- ✅ Training applicant management
- ✅ Training performance analytics
- ✅ Trainer profile management
- ✅ Payment processing for training posts
- ✅ File uploads for training materials
- ✅ Category and highlights management

### For Admins
- ✅ Complete user management (all user types)
- ✅ Job and training moderation
- ✅ Payment and pricing management
- ✅ System reporting and analytics
- ✅ Content archiving and cleanup
- ✅ Platform configuration

### System Features
- ✅ Role-based access control (Talent, Employer, Trainer, Admin)
- ✅ JWT-based authentication with refresh tokens
- ✅ Email notification system with templates
- ✅ File storage (AWS S3 and Google Cloud Storage)
- ✅ Payment processing with Stripe integration
- ✅ Database migrations with Alembic
- ✅ Comprehensive logging and error handling
- ✅ Contact form with admin notifications
- ✅ Auto-archiving of expired content

## 📁 Project Structure

```
iRxcruit-Backend/
├── app/
│   ├── main.py                    # FastAPI application entry point
│   ├── database.py                # Database configuration and session management
│   ├── init_db.py                 # Database initialization script
│   │
│   ├── dependencies/              # Shared dependencies
│   │   └── auth.py                # Authentication dependencies and JWT handling
│   │
│   ├── models/                    # Data models
│   │   ├── database_models.py     # SQLAlchemy ORM models
│   │   ├── user_models.py         # Pydantic models for user-related APIs
│   │   ├── job_models.py          # Pydantic models for job-related APIs
│   │   └── training_models.py     # Pydantic models for training-related APIs
│   │
│   ├── routers/                   # API route handlers
│   │   ├── auth.py                # Authentication endpoints (login, register, OAuth)
│   │   ├── talent.py              # Talent-specific endpoints
│   │   ├── employer.py            # Employer-specific endpoints
│   │   ├── trainer.py             # Trainer-specific endpoints
│   │   ├── admin.py               # Admin-specific endpoints
│   │   └── public.py              # Public endpoints (no authentication required)
│   │
│   ├── services/                  # Business logic layer
│   │   ├── auth.py                # Authentication and user management
│   │   ├── user.py                # User profile and data management
│   │   ├── job.py                 # Job posting and application logic
│   │   ├── training.py            # Training program and application logic
│   │   ├── payment.py             # Stripe payment processing
│   │   ├── pricing.py             # Pricing management for jobs and trainings
│   │   ├── email.py               # Email notification service (Resend API)
│   │   ├── storage.py             # File storage (AWS S3, Google Cloud)
│   │   ├── verification.py        # Email verification and password reset
│   │   ├── oauth.py               # Google OAuth integration
│   │   ├── contact.py             # Contact form handling
│   │   ├── reporting.py           # Data export and reporting
│   │   └── archiving.py           # Automated content archiving
│   │
│   └── templates/                 # Email templates (Jinja2)
│       ├── email_verification.html
│       ├── password_reset.html
│       ├── welcome.html
│       ├── contact_notification.html
│       ├── application_confirmation.html
│       └── application_status_update.html
│
├── alembic/                       # Database migrations
│   ├── versions/                  # Migration files
│   ├── env.py                     # Alembic environment configuration
│   └── alembic.ini                # Alembic configuration
│
├── tests/                         # Test suite
│   ├── test_public_routes.py      # Public API tests
│   └── README.md                  # Testing documentation
│
├── requirements.txt               # Python dependencies
├── run.py                         # Application runner script
├── setup.md                       # Setup instructions
├── prd.md                         # Production deployment guide
└── README.md                      # This documentation
```

## 🗄️ Database Schema

The application uses SQLAlchemy ORM with the following main entities:

### Core Models
- **User**: Base user model with authentication
- **Talent**: Extended profile for job seekers
- **Employer**: Company profiles for job posters
- **Trainer**: Profiles for training providers
- **Admin**: Administrative users

### Content Models
- **Job**: Job postings with requirements and details
- **Training**: Training programs with categories
- **JobApplication**: Job application tracking
- **TrainingApplication**: Training application tracking
- **SavedJob**: User's saved job listings

### Profile Models
- **Education**: Educational background
- **WorkExperience**: Professional experience
- **Certificate**: Certifications and achievements
- **Skill**: Skills and competencies
- **Hobby**: Personal interests
- **Language**: Language proficiencies
- **NotificationSettings**: User notification preferences

### System Models
- **Payment**: Payment transaction records
- **JobPricing**: Pricing tiers for job posts
- **TrainingPricing**: Pricing tiers for training posts
- **ContactSubmission**: Contact form submissions

## 🔐 Authentication & Authorization

### Authentication Methods
1. **Email/Password**: Traditional authentication with JWT tokens
2. **Google OAuth**: Social login integration
3. **Email Verification**: Required for account activation
4. **Password Reset**: Secure token-based password recovery

### Authorization Levels
- **Public**: No authentication required
- **Authenticated**: Valid JWT token required
- **Role-based**: Specific user type required (Talent, Employer, Trainer, Admin)

### JWT Token System
- Access tokens with configurable expiration
- Refresh token mechanism
- Secure token generation and validation

## 📧 Email System

Integrated email notification system using Resend API:

### Email Types
- **Verification**: Account email verification
- **Password Reset**: Secure password recovery
- **Welcome**: New user onboarding
- **Application Updates**: Job/training application status changes
- **Contact Notifications**: Admin notifications for contact form submissions

### Template System
- Jinja2-based HTML email templates
- Dynamic content rendering
- Responsive email design
- Fallback text content

## 💳 Payment Integration

Stripe-powered payment system for premium features:

### Payment Features
- Job posting payments for employers
- Training posting payments for trainers
- Flexible pricing tiers
- Payment history tracking
- Secure payment processing

### Pricing Management
- Dynamic pricing configuration
- Admin-controlled pricing tiers
- Payment validation and verification

## 📁 File Storage

Multi-provider file storage system:

### Supported Providers
- **AWS S3**: Primary cloud storage
- **Google Cloud Storage**: Alternative cloud storage
- **Local Storage**: Development and testing

### File Types
- Resume uploads (PDF, DOC, DOCX)
- Profile images
- Job posting images
- Training material uploads
- Certificate documents

## 🔧 API Endpoints

### Public Endpoints (`/public`)
- `GET /jobs` - Browse job listings
- `GET /trainings` - Browse training programs
- `POST /contact` - Submit contact form
- `GET /jobs/recommended` - Get recommended jobs
- `GET /trainings/recommended` - Get recommended trainings

### Authentication (`/auth`)
- `POST /register` - User registration
- `POST /login` - User login
- `POST /refresh` - Refresh JWT token
- `POST /verify-email` - Email verification
- `POST /forgot-password` - Password reset request
- `POST /reset-password` - Password reset confirmation
- `GET /google` - Google OAuth login
- `GET /google/callback` - Google OAuth callback

### Talent Endpoints (`/talent`)
- Profile management (education, experience, skills)
- Job applications and tracking
- Training applications
- File uploads (resume, documents)
- Notification settings
- Dashboard and recommendations

### Employer Endpoints (`/employer`)
- Job posting and management
- Applicant management
- Payment processing
- Company profile management
- Analytics and reporting

### Trainer Endpoints (`/trainer`)
- Training program management
- Applicant management
- Payment processing
- Trainer profile management
- Analytics and reporting

### Admin Endpoints (`/admin`)
- User management (all types)
- Content moderation
- Payment and pricing management
- System reporting
- Platform configuration

## 🚀 Getting Started

### Prerequisites
- Python 3.8 or higher
- pip (Python package installer)
- SQLite (included with Python)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/irxcruit-backend.git
   cd iRxcruit-Backend
   ```

2. **Create a virtual environment:**
   ```bash
   python -m venv venv
   ```

3. **Activate the virtual environment:**
   - Windows:
     ```bash
     venv\Scripts\activate
     ```
   - macOS/Linux:
     ```bash
     source venv/bin/activate
     ```

4. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

5. **Create environment file:**
   Copy `.env.example` to `.env` and configure:
   ```env
   # Database
   DATABASE_URL=sqlite:///./irxcruit.db
   
   # JWT Configuration
   JWT_SECRET_KEY=your-super-secret-jwt-key-here
   JWT_ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   
   # Email Service (Resend)
   RESEND_API_KEY=your-resend-api-key
   FROM_EMAIL=no-reply@yourdomain.com
   FROM_NAME=iRxcruit Team
   ADMIN_EMAIL=admin@yourdomain.com
   
   # File Storage (AWS S3)
   AWS_ACCESS_KEY_ID=your-aws-access-key
   AWS_SECRET_ACCESS_KEY=your-aws-secret-key
   AWS_REGION=us-east-1
   AWS_BUCKET_NAME=your-bucket-name
   
   # Google Cloud Storage (Alternative)
   GOOGLE_CLOUD_PROJECT=your-project-id
   GOOGLE_CLOUD_BUCKET=your-bucket-name
   
   # Google OAuth
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GOOGLE_REDIRECT_URI=http://localhost:8000/auth/google/callback
   
   # Stripe Payment
   STRIPE_SECRET_KEY=your-stripe-secret-key
   STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
   
   # Templates
   TEMPLATES_DIR=app/templates
   ```

6. **Initialize the database:**
   ```bash
   python -m alembic upgrade head
   python app/init_db.py
   ```

7. **Run the application:**
   ```bash
   python run.py
   ```
   Or using uvicorn directly:
   ```bash
   uvicorn app.main:app --reload
   ```

### Development Setup

The API will be available at:
- **Application**: http://localhost:8000
- **Interactive Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🧪 Testing

Run the test suite:

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app

# Run specific test file
pytest tests/test_public_routes.py

# Run with verbose output
pytest -v
```

## 🚀 Production Deployment

For production deployment, see `prd.md` for detailed instructions including:
- Environment configuration
- Database setup
- SSL/TLS configuration
- Performance optimization
- Monitoring and logging

## 🔧 Configuration

### Environment Variables

All configuration is handled through environment variables. See `.env.example` for a complete list of available options.

### Database Migrations

The application uses Alembic for database migrations:

```bash
# Create a new migration
python -m alembic revision --autogenerate -m "Description of changes"

# Apply migrations
python -m alembic upgrade head

# Rollback migrations
python -m alembic downgrade -1
```

## 📊 Monitoring & Logging

The application includes comprehensive logging:
- Request/response logging
- Error tracking
- Performance monitoring
- Security event logging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation at `/docs` endpoint

---