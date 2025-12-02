# Karnataka Wool Monitoring System - Complete Documentation

## Project Overview

The Karnataka Wool Monitoring System is a comprehensive React.js web application designed for the Karnataka Labour Welfare Board (KLWB) to monitor wool production from farm to fabric. It features blockchain-based traceability, quality assurance, marketplace functionality, and educational resources.

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Technology Stack](#technology-stack)
3. [Features Overview](#features-overview)
4. [Installation Guide](#installation-guide)
5. [User Roles & Permissions](#user-roles--permissions)
6. [API Documentation](#api-documentation)
7. [Database Schema](#database-schema)
8. [Blockchain Implementation](#blockchain-implementation)
9. [Security Features](#security-features)
10. [Deployment Guide](#deployment-guide)

## System Architecture

### Frontend Architecture
```
src/
├── components/          # Reusable UI components
├── pages/              # Main application pages
├── services/           # API and business logic services
├── context/            # React context providers
├── blockchain/         # Blockchain implementation
├── styles/             # CSS and styling files
└── data/              # Mock data and constants
```

### Backend Integration
- **Firebase Firestore**: Real-time database for storing batch data, user information, and transactions
- **Firebase Authentication**: User authentication and role management
- **Firebase Storage**: File storage for QR codes and documents

## Technology Stack

### Core Technologies
- **Frontend**: React.js 18 with functional components and hooks
- **Styling**: Bootstrap 5 with custom KLWB government theme
- **Routing**: React Router DOM v6
- **State Management**: React Context API
- **Icons**: Font Awesome 6

### Backend Services
- **Database**: Firebase Firestore (NoSQL)
- **Authentication**: Firebase Auth
- **Storage**: Firebase Storage
- **Real-time Updates**: Firebase real-time listeners

### Additional Libraries
- **QR Code Generation**: qrcode library
- **Maps**: React Leaflet with OpenStreetMap
- **Charts**: Chart.js with react-chartjs-2
- **Blockchain**: Custom implementation for traceability

## Features Overview

### 1. Traceability System
- **Blockchain-based tracking** from farm to fabric
- **QR code generation** for each wool batch
- **Real-time location tracking** with GPS coordinates
- **Supply chain visualization** with interactive maps

### 2. Quality Assurance
- **Digital quality certificates** with government validation
- **Multi-level grading system** (A+, A, B grades)
- **Quality inspector dashboard** for assessments
- **Automated quality scoring** based on wool parameters

### 3. Wool Marketplace
- **B2B marketplace** connecting farmers with buyers
- **Real-time pricing** and market information
- **Secure transaction processing** with payment integration
- **Inventory management** for farmers

### 4. User Management
- **Role-based access control** (Farmer, Buyer, Government, Inspector)
- **Multi-language support** (English, Kannada)
- **Government authentication** integration
- **Profile management** with verification

### 5. Analytics & Reporting
- **Real-time dashboards** with KPI metrics
- **Market trend analysis** with historical data
- **Government reporting** for policy decisions
- **Export capabilities** for data analysis

## Installation Guide

### Prerequisites
```bash
Node.js >= 16.0.0
npm >= 8.0.0
Git
```

### Setup Instructions
```bash
# Clone the repository
git clone <repository-url>
cd wool-monitoring-app

# Install dependencies
npm install

# Configure Firebase
# Create .env file with Firebase configuration
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id

# Start development server
npm start
```

### Environment Configuration
Create `.env` file in root directory:
```env
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

## User Roles & Permissions

### 1. Farmer Role
**Permissions:**
- Create and manage wool batches
- Generate QR codes for batches
- Track batch movement and processing
- List batches in marketplace
- View sales analytics

**Dashboard Features:**
- Batch creation and management
- QR code generation and printing
- Tracking history visualization
- Sales performance metrics

### 2. Buyer Role
**Permissions:**
- Browse marketplace listings
- Purchase wool batches
- Verify quality certificates
- Track order status
- Manage payment methods

**Dashboard Features:**
- Product catalog browsing
- Shopping cart and checkout
- Order history and tracking
- Quality verification tools

### 3. Government Role
**Permissions:**
- View system-wide analytics
- Generate compliance reports
- Monitor market trends
- Manage user verification
- Access audit trails

**Dashboard Features:**
- Comprehensive analytics dashboard
- Market trend visualization
- Compliance monitoring tools
- User management interface

### 4. Quality Inspector Role
**Permissions:**
- Conduct quality assessments
- Issue quality certificates
- Update batch quality grades
- Generate inspection reports
- Manage quality standards

**Dashboard Features:**
- Quality assessment interface
- Certificate generation tools
- Inspection history tracking
- Quality metrics dashboard

## API Documentation

### Authentication Endpoints
```javascript
// User login
authService.signIn(email, password)

// User registration
authService.signUp(userData)

// Password reset
authService.resetPassword(email)

// Sign out
authService.signOut()
```

### Batch Management Endpoints
```javascript
// Create new batch
firebaseService.createBatch(batchData)

// Get farmer batches
firebaseService.getFarmerBatches(farmerId)

// Update batch status
firebaseService.updateBatch(batchId, updateData)

// Get batch details
firebaseService.getBatch(batchId)
```

### Tracking Endpoints
```javascript
// Add tracking entry
firebaseService.addTrackingEntry(batchId, trackingData)

// Get tracking history
firebaseService.getTrackingHistory(batchId)

// Update batch location
firebaseService.updateBatchLocation(batchId, coordinates)
```

### Quality Management Endpoints
```javascript
// Save quality record
woolQualityService.saveQualityRecord(qualityData)

// Get quality records
woolQualityService.getQualityRecordByBatch(batchId)

// Update quality grade
woolQualityService.updateQualityGrade(batchId, grade)
```

## Database Schema

### Users Collection
```javascript
{
  uid: "string",
  email: "string",
  name: "string",
  role: "farmer|buyer|government|inspector",
  verified: boolean,
  createdAt: timestamp,
  profile: {
    phone: "string",
    address: "string",
    state: "string",
    district: "string"
  }
}
```

### Batches Collection
```javascript
{
  batchId: "string",
  farmerName: "string",
  farmerId: "string",
  batchName: "string",
  weight: number,
  woolType: "string",
  location: "string",
  coordinates: "string",
  status: "string",
  price: number,
  qualityGrade: "string",
  qrCode: "string",
  createdAt: timestamp,
  qualityData: {
    micron: number,
    stapleLength: number,
    strength: "string",
    color: "string"
  }
}
```

### Tracking Collection
```javascript
{
  entryId: "string",
  batchId: "string",
  location: "string",
  coordinates: "string",
  actor: "string",
  process: "string",
  status: "string",
  notes: "string",
  timestamp: timestamp
}
```

### Orders Collection
```javascript
{
  orderId: "string",
  buyerId: "string",
  buyerName: "string",
  items: array,
  totalAmount: number,
  status: "string",
  paymentMethod: "string",
  shippingAddress: "string",
  createdAt: timestamp
}
```

## Blockchain Implementation

### WoolChain Class
The blockchain implementation provides immutable tracking for wool batches:

```javascript
// Create new wool batch on blockchain
woolChain.addWoolBatch(batchData)

// Track movement between locations
woolChain.trackMovement(batchId, fromLocation, toLocation, actor)

// Add quality check record
woolChain.addQualityCheck(batchId, inspector, grade, notes)

// Get complete batch history
woolChain.getBatchHistory(batchId)

// Validate blockchain integrity
woolChain.isChainValid()
```

### Block Structure
```javascript
{
  index: number,
  timestamp: number,
  data: {
    type: "string",
    batchId: "string",
    actor: "string",
    // ... additional data
  },
  previousHash: "string",
  hash: "string",
  nonce: number
}
```

## Security Features

### Authentication Security
- **Firebase Authentication** with email/password
- **Role-based access control** (RBAC)
- **JWT token validation** for API calls
- **Session management** with automatic logout

### Data Security
- **Firestore security rules** for data access control
- **Input validation** and sanitization
- **XSS protection** with React's built-in security
- **CSRF protection** through Firebase SDK

### Blockchain Security
- **Cryptographic hashing** (SHA-256)
- **Proof of work** mining for block validation
- **Chain integrity verification**
- **Immutable audit trail**

## Deployment Guide

### Production Build
```bash
# Create production build
npm run build

# Test production build locally
npm install -g serve
serve -s build
```

### Firebase Hosting Deployment
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase project
firebase init hosting

# Deploy to Firebase
firebase deploy
```

### Environment Variables for Production
```env
REACT_APP_FIREBASE_API_KEY=production_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=production_domain
REACT_APP_FIREBASE_PROJECT_ID=production_project_id
REACT_APP_ENVIRONMENT=production
```

### Performance Optimization
- **Code splitting** with React.lazy()
- **Image optimization** and lazy loading
- **Bundle size optimization** with webpack-bundle-analyzer
- **Caching strategies** for static assets

## Maintenance & Support

### Monitoring
- **Firebase Analytics** for user behavior tracking
- **Performance monitoring** with Firebase Performance
- **Error tracking** with Firebase Crashlytics
- **Real-time database monitoring**

### Backup & Recovery
- **Automated Firestore backups**
- **Version control** with Git
- **Database export/import** procedures
- **Disaster recovery** planning

### Updates & Patches
- **Regular dependency updates**
- **Security patch management**
- **Feature rollout** procedures
- **Rollback strategies**

## Contributing Guidelines

### Code Standards
- **ESLint configuration** for code quality
- **Prettier formatting** for consistent style
- **Component documentation** with JSDoc
- **Unit testing** with Jest and React Testing Library

### Git Workflow
- **Feature branch** development
- **Pull request** reviews
- **Commit message** conventions
- **Version tagging** for releases

---

**Last Updated:** December 2024  
**Version:** 1.0.0  
**Maintained by:** Karnataka Labour Welfare Board Development Team