# Blockchain Wool Traceability Setup Guide

## What is Blockchain?
Blockchain is a distributed ledger technology that creates an immutable chain of blocks, each containing data. In our wool traceability system:
- Each wool batch registration creates a new block
- Every movement/transaction is recorded as a new block
- All data is cryptographically secured and cannot be altered
- Complete history is maintained from farm to fabric

## Firebase Setup

### 1. Create Firebase Project
1. Go to https://console.firebase.google.com/
2. Click "Create a project"
3. Enter project name: "wool-monitor"
4. Enable Google Analytics (optional)
5. Create project

### 2. Enable Authentication
1. In Firebase console, go to "Authentication"
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Email/Password"
5. Save

### 3. Create Firestore Database
1. Go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode"
4. Select location closest to you
5. Done

### 4. Get Firebase Configuration
1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps"
3. Click "Web" icon (</>)
4. Register app with name "wool-monitor-web"
5. Copy the config object

### 5. Configure Environment Variables
1. Create `.env` file in project root
2. Add your Firebase config:

```env
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
```

## How the Blockchain Works

### 1. Block Structure
Each block contains:
- **Index**: Position in chain
- **Timestamp**: When block was created
- **Data**: Wool batch or movement information
- **Previous Hash**: Links to previous block
- **Hash**: Unique identifier for this block
- **Nonce**: Number used for mining

### 2. Wool Batch Registration
When a farmer registers wool:
1. System creates new block with batch data
2. Block is "mined" (proof of work)
3. Block is added to chain
4. Data is also stored in Firebase for backup

### 3. Movement Tracking
When wool moves between locations:
1. New movement block is created
2. Links to previous blocks via hash
3. Records who moved it, from where to where
4. Creates immutable audit trail

### 4. Traceability Query
To track a batch:
1. Search blockchain for batch ID
2. Return all blocks related to that batch
3. Show complete journey from farm to fabric

## Running the Application

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm start
```

### 3. Test the System

#### Create Account:
1. Go to login page
2. Click "Sign Up"
3. Choose role (Farmer, Buyer, etc.)
4. Create account

#### Register Wool Batch (Farmer):
1. Login as farmer
2. Go to Traceability page
3. Fill batch registration form
4. Submit - creates blockchain block

#### Track Movement:
1. Use batch ID from registration
2. Add movement records
3. View complete blockchain history

## Key Features

### 1. Immutable Records
- Once data is in blockchain, it cannot be changed
- Provides trust and transparency
- Prevents fraud and tampering

### 2. Complete Traceability
- Track wool from sheep to final product
- See every step in the supply chain
- Verify authenticity and quality

### 3. Role-Based Access
- **Farmers**: Register batches, track movements
- **Buyers**: View batch history, verify authenticity
- **Assessors**: Add quality certifications
- **Government**: Monitor compliance and statistics

### 4. Real-time Updates
- Blockchain updates in real-time
- Firebase provides backup and sync
- All stakeholders see same data

## Security Features

### 1. Cryptographic Hashing
- SHA-256 encryption for all blocks
- Tamper-evident chain structure
- Secure data integrity

### 2. Firebase Authentication
- Secure user management
- Role-based permissions
- Protected API endpoints

### 3. Data Validation
- Input validation on all forms
- Blockchain integrity checks
- Error handling and recovery

## Troubleshooting

### Common Issues:
1. **Firebase not connecting**: Check .env file configuration
2. **Blockchain errors**: Ensure proper data format
3. **Authentication issues**: Verify Firebase Auth setup
4. **Performance**: Blockchain mining can be slow (normal)

### Debug Mode:
- Check browser console for errors
- Firebase console shows database activity
- Blockchain stats show system health

This system provides a complete, secure, and transparent wool traceability solution using modern blockchain technology combined with Firebase for reliability and scalability.