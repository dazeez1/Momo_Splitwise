# MoMo Split

**Tagline**: "Split bills, keep friends"

## Problem Statement

Groups (friends, roommates, saving groups) struggle to track shared expenses and fairly split costs using mobile money. Traditional cash-based splitting is inconvenient and mobile money platforms don't offer group expense management features.

## Target Users

- **University students** sharing accommodation and meals
- **Shared housing groups** managing household expenses  
- **Informal savings groups (chamas)** tracking contributions and expenses
- **Small business partnerships** splitting operational costs

## Core Features

1. **Create expense groups** - Set up groups with multiple members
2. **Add expenses with split percentages** - Record shared costs with custom split ratios
3. **Calculate who owes whom** - Automatic calculation of debts and credits
4. **Generate payment links for mobile money** - Direct integration with mobile money platforms
5. **Expense history and reports** - Track spending patterns and generate summaries

## Technology Stack

- **Backend**: Node.js with Express.js and TypeScript
- **Frontend**: React with TypeScript and Vite
- **Database**: MongoDB Atlas
- **Mobile Money API**: Simulated payment gateway
- **Development**: ESLint, Prettier, Jest

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- MongoDB Atlas account (or local MongoDB)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd Momo_Splitwise

# Install root dependencies
npm install

# Install backend dependencies
cd src/backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Return to root directory
cd ../..
```

### Development

```bash
# Start backend server (from root directory)
npm run dev:backend

# Start frontend development server (from root directory)
npm run dev:frontend

# Run both concurrently
npm run dev
```

### Testing

```bash
# Run backend tests
npm run test:backend

# Run frontend tests
npm run test:frontend

# Run all tests
npm test
```

## Project Structure

```
Momo_Splitwise/
├── README.md
├── .gitignore
├── package.json                 # Root workspace configuration
├── backend/                     # Node.js Express API
│   ├── controllers/             # Route controllers
│   ├── models/                 # Database models
│   ├── routes/                 # API routes
│   ├── middleware/             # Custom middleware
│   ├── utils/                  # Utility functions
│   ├── server.js               # Server entry point
│   ├── package.json            # Backend dependencies
│   └── .env.example            # Environment variables template
├── frontend/                   # React TypeScript app
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── pages/             # Page components
│   │   ├── hooks/             # Custom hooks
│   │   ├── services/           # API services
│   │   ├── utils/             # Utility functions
│   │   ├── App.tsx            # Main app component
│   │   └── main.tsx           # Entry point
│   ├── index.html             # HTML template
│   ├── vite.config.ts         # Vite configuration
│   └── package.json           # Frontend dependencies
└── shared/                     # Shared code between frontend and backend
    └── types/                  # TypeScript type definitions
```

## API Endpoints

### Groups
- `POST /api/groups` - Create a new expense group
- `GET /api/groups/:id` - Get group details
- `PUT /api/groups/:id` - Update group
- `DELETE /api/groups/:id` - Delete group

### Expenses
- `POST /api/expenses` - Add new expense
- `GET /api/expenses/group/:groupId` - Get group expenses
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

### Payments
- `POST /api/payments/request` - Request payment
- `POST /api/payments/simulate` - Simulate mobile money payment

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
