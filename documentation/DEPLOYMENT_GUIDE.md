# Deployment Guide - Karnataka Wool Monitoring System

## Overview

This guide provides step-by-step instructions for deploying the Karnataka Wool Monitoring System to production environments. The system is designed to be deployed on Firebase Hosting with Firestore as the backend database.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Firebase Configuration](#firebase-configuration)
4. [Build Process](#build-process)
5. [Deployment Steps](#deployment-steps)
6. [Domain Configuration](#domain-configuration)
7. [Security Configuration](#security-configuration)
8. [Performance Optimization](#performance-optimization)
9. [Monitoring & Analytics](#monitoring--analytics)
10. [Backup & Recovery](#backup--recovery)
11. [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements
- Node.js >= 16.0.0
- npm >= 8.0.0
- Git
- Firebase CLI
- Valid Google Cloud Platform account

### Development Tools
```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Verify installation
firebase --version
```

### Access Requirements
- Firebase project admin access
- Domain name (for custom domain setup)
- SSL certificate (handled by Firebase)

## Environment Setup

### 1. Clone Repository
```bash
git clone <repository-url>
cd wool-monitoring-system
```

### 2. Install Dependencies
```bash
# Install all project dependencies
npm install

# Verify no vulnerabilities
npm audit
npm audit fix
```

### 3. Environment Variables
Create production environment file:

```bash
# Create .env.production file
touch .env.production
```

Add production configuration:
```env
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your_production_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=klwb-wool-system.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=klwb-wool-system
REACT_APP_FIREBASE_STORAGE_BUCKET=klwb-wool-system.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789012
REACT_APP_FIREBASE_APP_ID=1:123456789012:web:abcdef123456

# Application Configuration
REACT_APP_ENVIRONMENT=production
REACT_APP_VERSION=1.0.0
REACT_APP_API_BASE_URL=https://klwb-wool-system.firebaseapp.com

# Analytics
REACT_APP_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX

# Feature Flags
REACT_APP_ENABLE_BLOCKCHAIN=true
REACT_APP_ENABLE_REAL_TIME_TRACKING=true
REACT_APP_ENABLE_PAYMENT_GATEWAY=true
```

## Firebase Configuration

### 1. Create Firebase Project
```bash
# Login to Firebase
firebase login

# Create new project (if not exists)
firebase projects:create klwb-wool-system

# Select project
firebase use klwb-wool-system
```

### 2. Initialize Firebase Services
```bash
# Initialize Firebase in project directory
firebase init

# Select services:
# - Hosting
# - Firestore
# - Functions (optional)
# - Storage
```

### 3. Configure Firestore Security Rules
Create `firestore.rules`:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Batches - farmers can create, all authenticated users can read
    match /batches/{batchId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && 
                   request.auth.token.role == 'farmer';
      allow update: if request.auth != null && 
                   (resource.data.farmerId == request.auth.uid || 
                    request.auth.token.role in ['government', 'inspector']);
    }
    
    // Tracking entries - authenticated users can read, specific roles can write
    match /tracking/{entryId} {
      allow read: if request.auth != null;
      allow create, update: if request.auth != null && 
                           request.auth.token.role in ['farmer', 'inspector', 'government'];
    }
    
    // Orders - buyers and sellers can access their orders
    match /orders/{orderId} {
      allow read, write: if request.auth != null && 
                        (resource.data.buyerId == request.auth.uid || 
                         resource.data.sellerId == request.auth.uid);
    }
    
    // Quality records - inspectors and government can write, all can read
    match /quality/{recordId} {
      allow read: if request.auth != null;
      allow create, update: if request.auth != null && 
                           request.auth.token.role in ['inspector', 'government'];
    }
  }
}
```

### 4. Configure Storage Security Rules
Create `storage.rules`:
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // QR codes - authenticated users can read, farmers can write
    match /qr-codes/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                  request.auth.token.role == 'farmer';
    }
    
    // Documents - role-based access
    match /documents/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                  request.auth.token.role in ['government', 'inspector'];
    }
  }
}
```

## Build Process

### 1. Pre-build Checks
```bash
# Run tests
npm test

# Check for linting errors
npm run lint

# Type checking (if using TypeScript)
npm run type-check

# Security audit
npm audit
```

### 2. Production Build
```bash
# Create optimized production build
npm run build

# Verify build output
ls -la build/
```

### 3. Build Optimization
```bash
# Analyze bundle size
npm install -g webpack-bundle-analyzer
npx webpack-bundle-analyzer build/static/js/*.js

# Optimize images (if needed)
npm install -g imagemin-cli
imagemin build/static/media/* --out-dir=build/static/media/
```

## Deployment Steps

### 1. Firebase Hosting Configuration
Create `firebase.json`:
```json
{
  "hosting": {
    "public": "build",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "/static/**",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000, immutable"
          }
        ]
      },
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000, immutable"
          }
        ]
      }
    ]
  },
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "storage": {
    "rules": "storage.rules"
  }
}
```

### 2. Deploy to Firebase
```bash
# Deploy all services
firebase deploy

# Deploy specific services
firebase deploy --only hosting
firebase deploy --only firestore:rules
firebase deploy --only storage
```

### 3. Verify Deployment
```bash
# Check deployment status
firebase hosting:sites:list

# Test deployed application
curl -I https://klwb-wool-system.firebaseapp.com
```

## Domain Configuration

### 1. Custom Domain Setup
```bash
# Add custom domain
firebase hosting:sites:create klwb-wool-system

# Connect domain
firebase hosting:sites:get klwb-wool-system
```

### 2. DNS Configuration
Add DNS records for custom domain:
```
Type: A
Name: @
Value: 151.101.1.195

Type: A  
Name: @
Value: 151.101.65.195

Type: CNAME
Name: www
Value: klwb-wool-system.firebaseapp.com
```

### 3. SSL Certificate
Firebase automatically provisions SSL certificates for custom domains.

## Security Configuration

### 1. Authentication Configuration
```javascript
// Configure Firebase Auth settings
const authConfig = {
  signInOptions: [
    firebase.auth.EmailAuthProvider.PROVIDER_ID
  ],
  signInFlow: 'popup',
  callbacks: {
    signInSuccessWithAuthResult: (authResult) => {
      // Handle successful sign-in
      return false;
    }
  }
};
```

### 2. Security Headers
Add security headers in `firebase.json`:
```json
{
  "hosting": {
    "headers": [
      {
        "source": "**",
        "headers": [
          {
            "key": "X-Content-Type-Options",
            "value": "nosniff"
          },
          {
            "key": "X-Frame-Options",
            "value": "DENY"
          },
          {
            "key": "X-XSS-Protection",
            "value": "1; mode=block"
          },
          {
            "key": "Strict-Transport-Security",
            "value": "max-age=31536000; includeSubDomains"
          },
          {
            "key": "Content-Security-Policy",
            "value": "default-src 'self'; script-src 'self' 'unsafe-inline' https://apis.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://firestore.googleapis.com https://identitytoolkit.googleapis.com"
          }
        ]
      }
    ]
  }
}
```

### 3. API Security
```javascript
// Rate limiting configuration
const rateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
};
```

## Performance Optimization

### 1. Code Splitting
```javascript
// Implement lazy loading for routes
const FarmerTraceability = React.lazy(() => import('./pages/FarmerTraceability'));
const ProductCatalog = React.lazy(() => import('./pages/ProductCatalog'));

// Wrap with Suspense
<Suspense fallback={<LoadingSpinner />}>
  <FarmerTraceability />
</Suspense>
```

### 2. Caching Strategy
```javascript
// Service worker for caching
const CACHE_NAME = 'klwb-wool-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});
```

### 3. Database Optimization
```javascript
// Firestore query optimization
const getBatches = () => {
  return db.collection('batches')
    .where('status', '==', 'AVAILABLE')
    .orderBy('createdAt', 'desc')
    .limit(20)
    .get();
};

// Use pagination for large datasets
const getPaginatedBatches = (lastDoc) => {
  let query = db.collection('batches')
    .orderBy('createdAt', 'desc')
    .limit(10);
    
  if (lastDoc) {
    query = query.startAfter(lastDoc);
  }
  
  return query.get();
};
```

## Monitoring & Analytics

### 1. Firebase Analytics Setup
```javascript
// Initialize Analytics
import { getAnalytics, logEvent } from 'firebase/analytics';

const analytics = getAnalytics();

// Track custom events
const trackBatchCreation = (batchId) => {
  logEvent(analytics, 'batch_created', {
    batch_id: batchId,
    user_role: 'farmer'
  });
};
```

### 2. Performance Monitoring
```javascript
// Firebase Performance Monitoring
import { getPerformance, trace } from 'firebase/performance';

const perf = getPerformance();

// Custom traces
const batchLoadTrace = trace(perf, 'batch_load_time');
batchLoadTrace.start();
// ... load batches
batchLoadTrace.stop();
```

### 3. Error Tracking
```javascript
// Error reporting
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();
const reportError = httpsCallable(functions, 'reportError');

window.addEventListener('error', (event) => {
  reportError({
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    stack: event.error?.stack
  });
});
```

## Backup & Recovery

### 1. Firestore Backup
```bash
# Export Firestore data
gcloud firestore export gs://klwb-wool-system-backup/$(date +%Y-%m-%d)

# Schedule automated backups
gcloud scheduler jobs create app-engine backup-firestore \
  --schedule="0 2 * * *" \
  --relative-url="/backup" \
  --http-method=POST
```

### 2. Code Backup
```bash
# Git repository backup
git remote add backup https://github.com/klwb/wool-system-backup.git
git push backup main

# Create release tags
git tag -a v1.0.0 -m "Production release v1.0.0"
git push origin v1.0.0
```

### 3. Recovery Procedures
```bash
# Restore from backup
gcloud firestore import gs://klwb-wool-system-backup/2024-12-01

# Rollback deployment
firebase hosting:clone klwb-wool-system:previous klwb-wool-system:current
```

## Troubleshooting

### Common Issues

#### 1. Build Failures
```bash
# Clear cache and rebuild
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### 2. Deployment Errors
```bash
# Check Firebase project status
firebase projects:list

# Verify authentication
firebase login --reauth

# Check quota limits
firebase projects:get klwb-wool-system
```

#### 3. Performance Issues
```bash
# Analyze bundle size
npm run build
npx webpack-bundle-analyzer build/static/js/*.js

# Check for memory leaks
npm install -g clinic
clinic doctor -- node server.js
```

#### 4. Database Connection Issues
```javascript
// Test Firestore connection
import { connectFirestoreEmulator } from 'firebase/firestore';

// For debugging
if (process.env.NODE_ENV === 'development') {
  connectFirestoreEmulator(db, 'localhost', 8080);
}
```

### Monitoring Commands
```bash
# Check application status
curl -f https://klwb-wool-system.firebaseapp.com/health || exit 1

# Monitor Firebase usage
firebase projects:get klwb-wool-system

# Check logs
firebase functions:log
```

### Emergency Procedures

#### 1. Immediate Rollback
```bash
# Rollback to previous version
firebase hosting:clone klwb-wool-system:previous klwb-wool-system:current

# Verify rollback
curl -I https://klwb-wool-system.firebaseapp.com
```

#### 2. Database Emergency
```bash
# Disable writes
firebase firestore:delete --all-collections --force

# Restore from backup
gcloud firestore import gs://klwb-wool-system-backup/latest
```

#### 3. Security Incident
```bash
# Revoke all user sessions
firebase auth:users:delete --all

# Update security rules
firebase deploy --only firestore:rules

# Rotate API keys
# (Manual process in Firebase Console)
```

## Maintenance Schedule

### Daily Tasks
- Monitor application performance
- Check error logs
- Verify backup completion

### Weekly Tasks
- Review security logs
- Update dependencies
- Performance analysis

### Monthly Tasks
- Security audit
- Capacity planning
- Backup testing

---

**Last Updated:** December 2024  
**Version:** 1.0.0  
**Maintained by:** Karnataka Labour Welfare Board Development Team