# Firestore Setup Instructions

## 1. Firestore Security Rules

Go to Firebase Console > Firestore Database > Rules and replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Batches collection - read public listed batches, write only own batches
    match /batches/{batchId} {
      allow read: if resource.data.isListed == true;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.farmerId;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.farmerId;
    }
    
    // Orders collection - only buyers and sellers can access their orders
    match /orders/{orderId} {
      allow read, write: if request.auth != null && 
        (request.auth.uid == resource.data.buyerId || 
         request.auth.uid == resource.data.sellerId);
      allow create: if request.auth != null;
    }
    
    // Reviews collection - read all, write only own reviews
    match /reviews/{reviewId} {
      allow read: if true;
      allow create, update, delete: if request.auth != null && request.auth.uid == resource.data.buyerId;
    }
    
    // Cart items - users can only access their own cart
    match /cart/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Quality assessments - read public, write only by assessors
    match /quality/{assessmentId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## 2. Create Collections and Sample Data

### Collection: `batches`
```javascript
// Document ID: auto-generated
{
  batchId: "BATCH001",
  farmerName: "Green Valley Farm",
  farmerId: "farmer1", 
  woolType: "Merino",
  weight: 25,
  price: 45.99,
  qualityGrade: "A+",
  location: "New Zealand",
  status: "AVAILABLE",
  isListed: true,
  createdAt: new Date("2024-01-15"),
  updatedAt: new Date("2024-01-15")
}
```

### Collection: `users`
```javascript
// Document ID: user ID
{
  userId: "farmer1",
  email: "farmer@example.com",
  role: "farmer",
  name: "John Farmer",
  verified: true,
  createdAt: new Date(),
  profile: {
    farmName: "Green Valley Farm",
    location: "New Zealand",
    phone: "+64123456789"
  }
}
```

### Collection: `orders`
```javascript
// Document ID: auto-generated
{
  orderId: "ORDER001",
  buyerId: "buyer1",
  sellerId: "farmer1",
  batchId: "BATCH001",
  quantity: 10,
  totalPrice: 459.90,
  status: "PENDING",
  createdAt: new Date(),
  shippingAddress: {
    street: "123 Main St",
    city: "Auckland",
    country: "New Zealand"
  }
}
```

### Collection: `reviews`
```javascript
// Document ID: auto-generated
{
  reviewId: "REV001",
  batchId: "BATCH001",
  buyerId: "buyer1",
  rating: 5,
  comment: "Excellent quality wool!",
  createdAt: new Date()
}
```

## 3. Steps to Set Up

1. **Go to Firebase Console**: https://console.firebase.google.com
2. **Select your project**: capstone-b8a7a
3. **Navigate to Firestore Database**
4. **Click "Rules" tab** and paste the security rules above
5. **Click "Publish"**
6. **Go to "Data" tab**
7. **Create collections** by clicking "Start collection"
8. **Add sample documents** using the data structures above

## 4. Test Data Script

Run this in your browser console on the app to add test data:

```javascript
import { seedFirestore } from './src/utils/seedFirestore.jsx';
seedFirestore();
```

## 5. Production Security Rules (Use Later)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Batches - farmers can write their own, everyone can read listed ones
    match /batches/{batchId} {
      allow read: if resource.data.isListed == true;
      allow write: if request.auth != null && request.auth.uid == resource.data.farmerId;
    }
    
    // Orders - buyers and sellers can access their orders
    match /orders/{orderId} {
      allow read, write: if request.auth != null && 
        (request.auth.uid == resource.data.buyerId || 
         request.auth.uid == resource.data.sellerId);
    }
    
    // Reviews - authenticated users can read all, write their own
    match /reviews/{reviewId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == resource.data.buyerId;
    }
  }
}
```