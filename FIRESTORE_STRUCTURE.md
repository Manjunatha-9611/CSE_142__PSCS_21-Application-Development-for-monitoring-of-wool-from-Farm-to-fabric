# Firestore Database Structure

## Collections Structure

### 1. users
```
users/{userId}
├── email: string
├── name: string
├── role: string (farmer, buyer, assessor, government)
├── phone: string
├── address: string
├── createdAt: timestamp
├── updatedAt: timestamp
├── isVerified: boolean
└── profile: string
```

### 2. batches
```
batches/{batchId}
├── batchId: string
├── farmerId: string
├── farmerName: string
├── woolType: string
├── weight: number
├── price: number
├── location: string
├── coordinates: string
├── currentLocation: string
├── status: string
├── qualityGrade: string
├── qualityScore: number
├── isListed: boolean
├── qrCode: string
├── qrData: string
├── createdAt: timestamp
├── updatedAt: timestamp
├── soldTo: string
└── soldDate: timestamp
```

### 3. tracking
```
tracking/{trackingId}
├── batchId: string
├── location: string
├── coordinates: string
├── process: string
├── status: string
├── actor: string
├── notes: string
├── timestamp: timestamp
└── entryId: string
```

### 4. quality_assessments
```
quality_assessments/{assessmentId}
├── batchId: string
├── assessorId: string
├── assessorName: string
├── grade: string
├── score: number
├── confidence: number
├── parameters: string
├── aiAnalysis: boolean
├── imageFileName: string
├── manualParams: string
├── timestamp: timestamp
└── assessmentId: string
```

### 5. certificates
```
certificates/{certificateId}
├── certificateId: string
├── batchId: string
├── farmerName: string
├── farmLocation: string
├── assessorId: string
├── assessorName: string
├── issuedDate: timestamp
├── expiryDate: timestamp
├── grade: string
├── score: number
├── confidence: number
├── parameters: string
├── marketValue: string
├── qrCode: string
├── verificationHash: string
├── aiModelVersion: string
└── status: string
```

### 6. orders
```
orders/{orderId}
├── orderId: string
├── buyerId: string
├── buyerName: string
├── items: string
├── subtotal: number
├── shipping: number
├── tax: number
├── totalAmount: number
├── shippingAddress: string
├── paymentMethod: string
├── status: string
├── notes: string
├── createdAt: timestamp
└── updatedAt: timestamp
```

### 7. cart_items
```
cart_items/{userId}
├── userId: string
├── items: string
└── updatedAt: timestamp
```

### 8. reviews
```
reviews/{reviewId}
├── reviewId: string
├── orderId: string
├── productId: string
├── userId: string
├── userName: string
├── rating: number
├── comment: string
├── createdAt: timestamp
└── isVerified: boolean
```

## Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Batches - farmers can create/update their own, others can read
    match /batches/{batchId} {
      allow read: if request.auth != null;
      allow create, update: if request.auth != null && 
        (resource == null || resource.data.farmerId == request.auth.uid);
    }
    
    // Orders - users can read/write their own orders
    match /orders/{orderId} {
      allow read, write: if request.auth != null && 
        (resource.data.buyerId == request.auth.uid || 
         resource.data.sellerId == request.auth.uid);
    }
    
    // Other collections - authenticated users can read/write
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```