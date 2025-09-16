# Banking API - Technical Design Document

## Table of Contents
1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Technology Stack](#technology-stack)
4. [Data Models](#data-models)
5. [API Design](#api-design)
6. [Authentication & Security](#authentication--security)
7. [Database Design](#database-design)
8. [Error Handling](#error-handling)
9. [Testing Strategy](#testing-strategy)

---

## Project Overview

### Purpose
The Banking API is a RESTful web service that simulates core banking operations including user account management, fund transfers, deposits, and withdrawals. It serves as a foundational system for digital banking applications.

### Scope
- User registration and authentication
- Inter-user fund transfers
- Secure API endpoints with JWT authentication

### Business Requirements
- A user can create an account (with email and password)
- A user can fund their account
- A user can transfer funds to another user's account
- A user can withdraw funds from their account

---

## System Architecture
```

### Component Architecture
```
Banking API Server
├── Entry Point (index.js)
├── Routes Layer
|   └── users and transcations 
|      └── /api/v1/users/*
|      └── /api/v1/accounts/*
├── Middleware Layer
│   ├── Authentication (JWT)
├── Controller Layer
│   ├── User Management
├── Model Layer
│   ├── User Schema
│   └── Transaction Schema
└── Database Layer
    └── MongoDB Connection
```


---

## Technology Stack

### Backend Framework
- **Node.js** (v14+): JavaScript runtime environment
- **Mongoose** (v8.18.1): MongoDB object modeling

### Database
- **MongoDB**: NoSQL document database for user and transaction data

### Authentication & Security
- **JSON Web Tokens (JWT)**: Stateless authentication
- **bcryptjs** (v3.0.2): Password hashing and salting
- **dotenv** (v17.2.2): Environment variable management

### Testing
- **Jest** (v30.1.3)
- **Supertest** (v7.1.4)

### Development Tools
- **npm**
- **Git**

---

## Data Models

### User Model
```javascript
{
  _id: ObjectId,           // Auto-generated MongoDB ID
  email: String,           // Unique, lowercase, trimmed
  password: String,        // bcrypt hashed
  balance: Number,         // Account balance (default: 0)
  createdAt: Date,         // Auto-generated timestamp
  updatedAt: Date          // Auto-updated timestamp
}
```

**Business Rules:**
- Email must be unique across the system
- Password is hashed using bcrypt with salt rounds of 10
- Balance cannot be negative
- Email is automatically converted to lowercase

### Transaction Model
```javascript
{
  _id: ObjectId,           // Auto-generated MongoDB ID
  type: String,            // Enum: ['fund', 'transfer', 'withdraw']
  amount: Number,          // Transaction amount (positive)
  sender: ObjectId,        // Reference to User (always required)
  receiver: ObjectId,      // Reference to User (always required)
  status: String,          // Enum: ['pending', 'completed', 'failed']
  createdAt: Date          // Transaction timestamp
}
```

---

## API Design

### Base URL
```
http://localhost:3000/api/v1
```

### Authentication Endpoints

#### Register User
```http
POST /users/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}

Response (201):
{
  "user": {
    "_id": "user_id",
    "email": "user@example.com",
    "balance": 0
  },
  "token": "jwt_token"
}
```

#### Login User
```http
POST /users/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}

Response (200):
{
  "user": {
    "_id": "user_id",
    "email": "user@example.com",
    "balance": 0
  },
  "token": "jwt_token"
}
```

### Account Operation Endpoints

#### Fund Account
```http
POST /accounts/fund
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "amount": 100
}

Response (200):
{
  "user": {
    "_id": "user_id",
    "email": "user@example.com",
    "balance": 100
  },
  "transaction": {
    "_id": "transaction_id",
    "type": "fund",
    "amount": 100,
    "sender": "user_id",
    "status": "completed"
  }
}
```

#### Transfer Funds
```http
POST /accounts/transfer
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "recipientEmail": "recipient@example.com",
  "amount": 50
}

Response (200):
{
  "message": "Transfer successful.",
  "sender": {
    "_id": "sender_id",
    "email": "sender@example.com",
    "balance": 50
  },
  "receiver": {
    "_id": "receiver_id",
    "email": "recipient@example.com",
    "balance": 50
  },
  "transaction": {
    "_id": "transaction_id",
    "type": "transfer",
    "amount": 50,
    "sender": "sender_id",
    "receiver": "receiver_id",
    "status": "completed"
  }
}
```

#### Withdraw Funds
```http
POST /accounts/withdraw
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "amount": 30
}

Response (200):
{
  "user": {
    "_id": "user_id",
    "email": "user@example.com",
    "balance": 70
  },
  "transaction": {
    "_id": "transaction_id",
    "type": "withdraw",
    "amount": 30,
    "sender": "user_id",
    "status": "completed"
  }
}
```

### Error Responses
```http
400 Bad Request:
{
  "error": "Amount must be positive."
}

401 Unauthorized:
{
  "error": "Please authenticate."
}

404 Not Found:
{
  "error": "User not found."
}

500 Internal Server Error:
{
  "error": "Server error."
}
```

---

## Authentication & Security

### Environment Variables
```bash
MONGO_URI=mongodb://localhost:27017/banking_api
JWT_SECRET=your_jwt_secret_key
PORT=3000
NODE_ENV=development
```

---

## Database Design

### Collections

#### users Collection
```javascript
{
  _id: ObjectId("..."),
  email: "user@example.com",
  password: "$2a$10$...", // bcrypt hash
  balance: 100,
  __v: 0
}
```

#### transactions Collection
```javascript
{
  _id: ObjectId("..."),
  type: "transfer",
  amount: 50,
  sender: ObjectId("..."),
  receiver: ObjectId("..."),
  status: "completed",
  createdAt: ISODate("2024-01-01T00:00:00.000Z"),
  __v: 0
}
```

### Indexing Strategy
- **users.email**: Unique index for fast user lookup
- **transactions.sender**: Index for user transaction history
- **transactions.createdAt**: Index for chronological queries
- **transactions.type**: Index for transaction type filtering
---

## Testing Strategy

### Test Framework
- **Jest**: Primary testing framework
- **Supertest**: HTTP endpoint testing

### Test Categories

#### Unit Tests
- Model validation
- Password hashing/comparison
- JWT token generation/verification

#### Integration Tests
- API endpoint testing
- Database operations
- Authentication flow

#### Test Coverage
Current test suite covers:
- User registration and login
- Account funding operations
- Fund transfer between users
- Withdrawal operations

---

## Conclusion

The Banking API provides a solid foundation for digital banking operations with a clean, RESTful design. The current implementation focuses on core functionality while maintaining simplicity and testability. 

The system successfully demonstrates modern web API development practices including JWT authentication, secure password handling, comprehensive testing, and clear separation of concerns. 

---

**Document Version**: 1.0  
**Last Updated**: September 16, 2025  
**Author**: Vivian Akpoke
**Review Status**: Backend Developer Assessment Pending
