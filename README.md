# Real-time Chat Application

A full-stack chat application built with Next.js, Socket.IO, and MongoDB.

## Features

- Real-time messaging using Socket.IO
- User authentication with JWT
- MongoDB for data persistence
- Redux Toolkit for state management
- Modern UI with SCSS modules

## Prerequisites

- Node.js 14.x or later
- MongoDB
- npm or yarn

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd chat-app
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory with the following variables:
```
MONGODB_URI=mongodb://localhost:27017/chat-app
JWT_SECRET=your-secret-key-here
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
NEXT_PUBLIC_CLIENT_URL=http://localhost:3000
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at http://localhost:3000.

## Project Structure

```
├── components/         # React components
├── pages/             # Next.js pages
├── store/             # Redux store and slices
├── styles/            # SCSS modules
├── utils/             # Utility functions
├── models/            # MongoDB models
└── server/            # Socket.IO server
```

## API Routes

- POST /api/auth/login - User login
- POST /api/auth/signup - User registration
- GET /api/messages - Get chat messages
- POST /api/messages - Send a new message

## Technologies Used

- Next.js
- Socket.IO
- MongoDB
- Redux Toolkit
- SCSS Modules
- JWT Authentication 