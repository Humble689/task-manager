# Task Manager

A full-stack task management application built with React, Node.js, and MongoDB.

## Features

- User authentication and authorization
- Real-time task updates using Socket.IO
- Responsive design with Material-UI
- Dark/Light mode support
- Guest mode for quick access
- Task management (Create, Read, Update, Delete)
- Task status and priority management
- Due date tracking

## Tech Stack 

- Frontend: React.js with Material-UI
- Backend: Node.js with Express
- Database: MongoDB
- Real-time: Socket.IO
- Authentication: JWT

## Project Structure

```
task-manager/
├── client/                 # React frontend
│   ├── public/            # Static files
│   └── src/               # React source code
├── server/                # Node.js backend
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   └── middleware/       # Custom middleware
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/task-manager.git
   cd task-manager
   ```

2. Install backend dependencies:
   ```bash
   cd server
   npm install
   ```

3. Install frontend dependencies:
   ```bash
   cd ../client
   npm install
   ```

4. Create a `.env` file in the server directory:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/task-manager
   JWT_SECRET=your_jwt_secret_key_here
   CLIENT_URL=http://localhost:3000
   ```

5. Start the development servers:
   ```bash
   # Start backend server
   cd server
   npm run dev

   # Start frontend server
   cd ../client
   npm start
   ```

## Usage

- Access the application at http://localhost:3000
- Register a new account or use guest mode
- Create, edit, and manage your tasks
- Toggle between dark and light mode
- Track task progress and deadlines

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 
