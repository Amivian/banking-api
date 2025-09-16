
# Banking API

A RESTful API built with Node.js and Express that simulates core banking operations. This system allows users to create accounts, manage funds, transfer money between users, and maintain transaction history with secure JWT authentication.


## Features

- *User Management*
  - User registration with email and password
  - Secure user authentication using JWT tokens
  - Password hashing with bcrypt

- **Account Operations**
  - Fund account from external sources
  - Transfer funds between registered users
  - Withdraw funds from account
  - Real-time balance updates

- **Transaction Management**
  - Complete transaction history logging
  - Transaction status tracking
  - Audit trail for all financial operations

- **Security**
  - JWT-based authentication
  - Password encryption
  - Input validation and error handling

## Technology Stack

- **Backend**: Node.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT)
- **Password Security**: bcryptjs
- **Testing**: Jest, Supertest
- **Environment Management**: dotenv

## Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (version 14 or higher)
- **MongoDB** (local installation or MongoDB Atlas account)
- **npm**

## Installation

### 1. Clone the Repository
```bash
git clone https://github.com/amivian/banking-api.git
cd banking-api
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory with the following variables:

```env
MONGO_URI=mongodb://localhost:27017/banking_api
JWT_SECRET=your_super_secret_jwt_key_here
PORT=3000
NODE_ENV=development
```

**Important Notes:**
- Replace `your_super_secret_jwt_key_here` with a strong, random secret key
- If using MongoDB Atlas, replace the MONGO_URI with your Atlas connection string
- Port 3000 is used to avoid conflicts with other services

### 4. Database Setup
Make sure MongoDB is running on your system:

**For Local MongoDB:**
```bash
# On Windows (if MongoDB is installed as a service)
net start MongoDB
```

**For MongoDB Atlas:**
- Create a cluster on [MongoDB Atlas](https://www.mongodb.com/atlas)
- Get your connection string and update the MONGO_URI in `.env`

## Running the Application

### Development Mode
```bash
npm start
```

The server will start on `http://localhost:3000` (or the port specified in your .env file).

You should see:
```
Server is running on port 3000
MongoDB connected successfully
```

### Running Tests
```bash
npm test
```

This will run the complete test suite including:
- User registration and authentication
- Account funding operations
- Fund transfers between users
- Withdrawal operations

## API Endpoints

### Base URL
```
http://localhost:3000/api/v1
```

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/users/register` | Register a new user | No |
| POST | `/users/login` | Login existing user | No |

### Account Operations

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/accounts/fund` | Add funds to account | Yes |
| POST | `/accounts/transfer` | Transfer funds to another user | Yes |
| POST | `/accounts/withdraw` | Withdraw funds from account | Yes |

## Testing with Postman

### Quick Setup
1. **Import Collection**: Import the `banking-api.postman_collection.json` file into Postman
2. **Set Base URL**: The collection uses `http://localhost:3000/api/v1`
3. **Run Tests**: Execute requests in the following order

### Manual Testing Steps

#### Step 1: Register First User
```http
POST http://localhost:3000/api/v1/users/register
Content-Type: application/json

{
    "email": "alice@example.com",
    "password": "password123"
}
```

**Expected Response:**
```json
{
    "user": {
        "_id": "user_id_here",
        "email": "alice@example.com",
        "balance": 0
    },
    "token": "jwt_token_here"
}
```

**Important**: Copy the `token` value for subsequent requests.

#### Step 2: Register Second User
```http
POST http://localhost:3000/api/v1/users/register
Content-Type: application/json

{
    "email": "bob@example.com",
    "password": "password456"
}
```

#### Step 3: Login User
```http
POST http://localhost:3000/api/v1/users/login
Content-Type: application/json

{
    "email": "alice@example.com",
    "password": "password123"
}
```

#### Step 4: Fund Account
```http
POST http://localhost:3000/api/v1/accounts/fund
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN_HERE

{
    "amount": 1000
}
```

#### Step 5: Transfer Funds
```http
POST http://localhost:3000/api/v1/accounts/transfer
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN_HERE

{
    "recipientEmail": "bob@example.com",
    "amount": 250
}
```

#### Step 6: Withdraw Funds
```http
POST http://localhost:3000/api/v1/accounts/withdraw
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN_HERE

{
    "amount": 100
}
```
## Project Structure

```
banking-api/
├── controllers/
│   └── userController.js      # Business logic for user operations
├── middleware/
│   └── auth.js               # JWT authentication middleware
├── models/
│   ├── user.js              # User data model
│   └── transaction.js       # Transaction data model
├── routes/
│   └── user.js              # API route definitions
├── tests/
│   └── user.test.js         # Test suite
├── .env                     # Environment variables (create this)
├── .gitignore              # Git ignore rules
├── index.js                # Application entry point
├── package.json            # Dependencies and scripts
└── README.md              # This file
```

## Testing

The project includes comprehensive tests covering:

- User registration and login
- Account funding operations
- Fund transfers between users
- Withdrawal operations
- Insufficient balance scenarios
- Authentication middleware

Run tests with:
```bash
npm test
```

## Technical Design Document

- `TECHNICAL_DESIGN_DOCUMENT.md` - Comprehensive technical specifications.
