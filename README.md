# Hotel Reservation System

A modern, full-stack hotel reservation system built with TypeScript, React, and Node.js. This application allows users to book hotel rooms, manage reservations, and provides an admin interface for hotel management.

## Features

### User Features
- User registration and authentication
- Room browsing and searching
- Room availability checking
- Booking creation and management
- View booking history
- Special requests for bookings

### Admin Features
- User management
- Room management (CRUD operations)
- Booking management
- View all reservations
- Update booking status
- View user details

## Technologies Used

### Frontend
- **React** - User interface library
- **TypeScript** - Type-safe JavaScript
- **TanStack Query** - Data fetching and caching
- **Shadcn UI** - Modern UI components
- **React Router** - Navigation and routing
- **Axios** - HTTP client
- **React Hot Toast** - Toast notifications
- **Lucide Icons** - Icon library

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **TypeScript** - Type-safe JavaScript
- **MongoDB** - Database
- **Mongoose** - MongoDB ODM
- **OpenAPI/Swagger** - API documentation
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Zod** - Schema validation

## Project Structure

```
hotel_reservation/
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── layouts/        # Page layouts
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── hooks/         # Custom React hooks
│   │   ├── types/         # TypeScript types
│   │   └── utils/         # Utility functions
│   └── package.json
└── backend/
    ├── src/
    │   ├── controllers/   # Route controllers
    │   ├── services/      # Business logic
    │   ├── models/        # Database models
    │   ├── routes/        # API routes
    │   ├── interfaces/    # TypeScript interfaces
    │   └── utils/         # Utility functions
    └── package.json
```

## Key Features Implementation

### Authentication
- JWT-based authentication
- Role-based access control (Admin/User)
- Secure password hashing
- Protected routes

### Room Management
- Room creation, updating, and deletion
- Room availability checking
- Room type categorization
- Price management

### Booking System
- Real-time availability checking
- Date range validation
- Guest count validation
- Special requests handling
- Booking status management

### User Interface
- Modern, responsive design
- Interactive data tables
- Form validation
- Toast notifications
- Loading states
- Error handling

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/hotel_reservation.git
cd hotel_reservation
```

2. Install frontend dependencies:
```bash
cd frontend
npm install
```

3. Install backend dependencies:
```bash
cd ../backend
npm install
```

4. Set up environment variables:
Create `.env` files in both frontend and backend directories with necessary configuration.

5. Start the development servers:

Frontend:
```bash
cd frontend
npm run dev
```

Backend:
```bash
cd backend
npm run dev
```

## API Documentation

The API documentation is available at `/api-docs` when running the backend server. It provides detailed information about all available endpoints, request/response formats, and authentication requirements.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Shadcn UI for the beautiful component library
- TanStack Query for efficient data fetching
- MongoDB for the database solution
- All other open-source libraries used in this project 