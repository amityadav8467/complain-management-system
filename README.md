# Complaint Management System

A full-stack Complaint Management System built with React.js, Node.js/Express, MongoDB, and JWT authentication.

## Features

### User Side
- User Registration & Login with JWT authentication
- Personal dashboard with complaint statistics
- Submit complaints with file attachments
- View complaint history with search & filter
- Track complaint status in real-time

### Admin Side
- Admin/Staff login with role-based access
- Dashboard with statistics (total, pending, in progress, resolved)
- View all complaints with pagination
- Filter complaints by status, category, and priority
- Update complaint status and add admin notes
- Assign complaints to staff members
- Delete complaints
- User management (view, edit roles, deactivate, delete)

## Tech Stack

- **Frontend**: React.js (Vite) + Tailwind CSS
- **Backend**: Node.js + Express.js
- **Database**: MongoDB + Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **HTTP Client**: Axios

## Project Structure

```
complain-management-system-2/
├── backend/
│   ├── config/db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── complaintController.js
│   │   └── userController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   └── fileUpload.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Complaint.js
│   │   └── Category.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── complaints.js
│   │   └── users.js
│   ├── uploads/
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── Sidebar.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── AdminComplaints.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AdminUsers.jsx
│   │   │   ├── ComplaintHistory.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── NotFound.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── SubmitComplaint.jsx
│   │   │   └── UserDashboard.jsx
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   └── complaintService.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
└── README.md
```

## Setup & Installation

### Prerequisites
- Node.js >= 18
- MongoDB (local or MongoDB Atlas)

### Backend Setup

```bash
cd backend
npm install

# Copy and configure environment variables
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

npm run dev   # development
npm start     # production
```

### Frontend Setup

```bash
cd frontend
npm install

# Copy environment variables (optional)
cp .env.example .env

npm run dev   # development server on http://localhost:3000
npm run build # production build
```

## Environment Variables

### Backend (`backend/.env`)
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/complaint-management
JWT_SECRET=your_super_secret_key
JWT_EXPIRE=30d
NODE_ENV=development
```

### Frontend (`frontend/.env`)
```
VITE_API_URL=http://localhost:5000/api
```

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/admin-login` | Admin/Staff login |
| GET | `/api/auth/me` | Get current user |

### Complaints (User)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/complaints` | Submit new complaint |
| GET | `/api/complaints/my` | Get user's complaints |
| GET | `/api/complaints/:id` | Get complaint details |
| PUT | `/api/complaints/:id` | Update own complaint |
| DELETE | `/api/complaints/:id` | Delete own complaint |

### Complaints (Admin)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/complaints` | Get all complaints |
| GET | `/api/complaints/admin/stats` | Get dashboard stats |
| PUT | `/api/complaints/:id/status` | Update complaint status |
| PUT | `/api/complaints/:id/assign` | Assign complaint |
| DELETE | `/api/complaints/:id` | Delete complaint |

### Users (Admin)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Get all users |
| PUT | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Delete user |

## Creating an Admin User

After starting the server, you can create an admin user by registering normally and then updating the role in MongoDB:

```js
// In MongoDB shell or Compass
db.users.updateOne({ email: "admin@example.com" }, { $set: { role: "admin" } })
```

Or seed directly via script:
```js
// Quick seed (run once)
const User = require('./models/User');
await User.create({
  name: 'Admin',
  email: 'admin@example.com',
  password: 'admin123',
  role: 'admin'
});
```

## Deployment

### Backend (Render)
1. Push code to GitHub
2. Create a new Web Service on Render
3. Set build command: `cd backend && npm install`
4. Set start command: `cd backend && npm start`
5. Add environment variables

### Frontend (Vercel)
1. Push code to GitHub
2. Import project on Vercel
3. Set root directory to `frontend`
4. Add `VITE_API_URL` environment variable pointing to your deployed backend

### Database (MongoDB Atlas)
1. Create cluster on [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Get connection string
3. Update `MONGO_URI` in backend environment variables
