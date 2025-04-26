# Home Funders

A modern web application for managing home loans and user profiles.

## Features

- User Authentication (Register, Login, Logout)
- Profile Management
- Loan Application System
  - Urban Loans
  - Rural Loans
- Document Upload
- Admin Dashboard
  - User Management
  - Loan Management
- Responsive Design

## Prerequisites

- Node.js (v14.0.0 or higher)
- MongoDB
- Cloudinary Account (for file uploads)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/kattayashchaitanya/homefunders.git
cd homefunders
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration:
- Set your MongoDB connection string
- Configure JWT secret and expiration
- Add your Cloudinary credentials
- Adjust security settings as needed

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Project Structure

```
homefunders/
├── config/           # Configuration files
├── controllers/      # Route controllers
├── middleware/       # Custom middleware
├── models/          # Database models
├── public/          # Static files and frontend
├── routes/          # API routes
├── utils/           # Utility functions
├── .env             # Environment variables
├── .env.example     # Environment variables template
├── main.js          # Application entry point
└── package.json     # Project dependencies
```

## API Endpoints

### Authentication
- POST /api/auth/register - Register a new user
- POST /api/auth/login - Login user
- GET /api/auth/logout - Logout user
- GET /api/auth/me - Get current user

### Profile
- GET /api/profile/me - Get current user profile
- PUT /api/profile/update - Update user profile
- POST /api/profile/upload-image - Upload profile image

### Loans
- POST /api/loans/urban - Apply for urban loan
- POST /api/loans/rural - Apply for rural loan
- GET /api/loans - Get user's loans
- GET /api/loans/:id - Get loan details

### Admin
- GET /api/admin/loans - Get all loans
- PUT /api/admin/loans/:id/approve - Approve loan
- PUT /api/admin/loans/:id/reject - Reject loan
- GET /api/admin/users - Get all users
- GET /api/admin/users/:id - Get user details
- PUT /api/admin/users/:id - Update user
- DELETE /api/admin/users/:id - Delete user

## Security Features

- Password hashing with bcrypt
- JWT authentication
- Rate limiting
- Data sanitization
- XSS protection
- CORS enabled
- Helmet security headers
- HTTP parameter pollution prevention

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 
