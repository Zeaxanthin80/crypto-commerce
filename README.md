# Crypto Commerce Platform

A full-featured e-commerce platform similar to Amazon with cryptocurrency (USDT) payment integration.

## Features

- **User Account Management**
  - Registration and authentication
  - Profile settings
  - IAM (Identity and Access Management)
  - Purchase history
  - Payment method management (USDT cryptocurrency)

- **Vendor Portal**
  - Vendor registration and authentication
  - Product management
  - Order management
  - Sales analytics
  - Payout configuration

- **Product Management**
  - Category and subcategory organization
  - Product search with filters
  - Reviews and ratings
  - Inventory management

- **Shopping Experience**
  - Shopping cart
  - Wishlist
  - Checkout process
  - USDT cryptocurrency payments
  - Order tracking

## Technology Stack

- **Frontend**
  - React.js
  - Next.js
  - TailwindCSS
  - TypeScript

- **Backend**
  - Node.js
  - Express.js
  - JSON Web Tokens (JWT)
  - Web3.js (for cryptocurrency integration)

- **Database**
  - PostgreSQL
  - Sequelize ORM

## Project Structure

```
crypto-commerce/
├── frontend/           # Next.js frontend application
│   ├── public/         # Static assets
│   └── src/
│       ├── components/ # Reusable UI components
│       ├── pages/      # Application pages
│       ├── context/    # Context providers
│       ├── styles/     # CSS and style files
│       ├── utils/      # Utility functions
│       ├── assets/     # Images and other assets
│       └── hooks/      # Custom React hooks
│
├── backend/            # Node.js backend application
│   ├── config/         # Configuration files
│   └── src/
│       ├── controllers/# Route controllers
│       ├── models/     # Database models
│       ├── routes/     # API routes
│       ├── middleware/ # Custom middleware
│       ├── services/   # Business logic
│       └── utils/      # Utility functions
│
└── database/           # Database migrations and seeds
```

## Setup Instructions

### Prerequisites
- Node.js and npm
- PostgreSQL
- Metamask wallet (for cryptocurrency transactions)

### Installation

1. Clone the repository
2. Install frontend dependencies:
   ```
   cd frontend
   npm install
   ```
3. Install backend dependencies:
   ```
   cd backend
   npm install
   ```
4. Set up the PostgreSQL database
5. Configure environment variables (see .env.example files)
6. Start the development servers:
   - Frontend: `npm run dev` in the frontend directory
   - Backend: `npm run dev` in the backend directory

## Cryptocurrency Integration

This platform uses USDT (Tether) for payments, integrated through Web3.js and Metamask.

## Deployment Guide

### Prerequisites
- Node.js 14.x or later
- npm or yarn
- Git
- Vercel account (sign up at [vercel.com](https://vercel.com))

### Local Development
1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/crypto-commerce.git
   cd crypto-commerce
   ```

2. Install dependencies
   ```bash
   # For frontend
   cd frontend
   npm install
   
   # For backend
   cd ../backend
   npm install
   ```

3. Set up environment variables
   - Create `.env.local` in the frontend directory
   - Create `.env` in the backend directory

4. Run development servers
   ```bash
   # Frontend (from frontend directory)
   npm run dev
   
   # Backend (from backend directory)
   npm run dev
   ```

### Deploying to Vercel

#### Frontend Deployment
1. Push your code to GitHub
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. Connect to Vercel
   - Go to [vercel.com](https://vercel.com) and sign in
   - Click "Import Project" and select your GitHub repository
   - Configure project settings:
     - Framework Preset: Next.js
     - Root Directory: ./frontend
     - Build Command: npm run build
     - Output Directory: .next

3. Configure Environment Variables
   - Add the following environment variables in Vercel dashboard:
     - NEXT_PUBLIC_API_URL
     - NEXT_PUBLIC_ETHEREUM_PROVIDER_URL
     - NEXT_PUBLIC_PLATFORM_WALLET_ADDRESS
     - NEXT_PUBLIC_USDT_CONTRACT_ADDRESS

4. Deploy
   - Click "Deploy" and wait for the build to complete
   - Your site will be available at a *.vercel.app URL

#### Backend Deployment Options

1. **Heroku**
   - Create a Procfile in the backend directory:
     ```
     web: npm start
     ```
   - Push to Heroku:
     ```bash
     heroku create your-app-name
     git subtree push --prefix backend heroku main
     ```

2. **Railway**
   - Connect your GitHub repository
   - Set the root directory to ./backend
   - Configure environment variables
   - Deploy

3. **AWS Elastic Beanstalk**
   - Install EB CLI
   - Initialize EB project in backend directory
   - Deploy:
     ```bash
     eb init
     eb create
     eb deploy
     ```

### CI/CD with Vercel

Vercel automatically sets up CI/CD when you connect your GitHub repository:

1. **Production Deployments**
   - Every push to the main branch triggers a production deployment

2. **Preview Deployments**
   - Every pull request gets a unique preview URL
   - Collaborators can review changes before merging

3. **Environment Variables per Branch**
   - Configure different variables for production vs. preview deployments

4. **Rollbacks**
   - Easily roll back to previous deployments if issues occur

### Monitoring and Analytics

1. **Vercel Analytics**
   - Enable in the Vercel dashboard
   - Monitor performance metrics
   - Track user behavior

2. **Error Tracking**
   - Integrate Sentry for error monitoring
   - Add to your Next.js app:
     ```bash
     npm install @sentry/nextjs
     ```

### Domain Setup

1. Add your custom domain in Vercel dashboard
2. Configure DNS settings as instructed
3. Enable HTTPS (automatic with Vercel)

## Maintenance and Updates

### Updating Dependencies
```bash
npm outdated
npm update
```

### Security Audits
```bash
npm audit
npm audit fix
```
