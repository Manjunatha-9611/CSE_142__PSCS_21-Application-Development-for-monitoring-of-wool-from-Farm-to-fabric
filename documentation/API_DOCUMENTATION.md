# API Documentation - Karnataka Wool Monitoring System

## Overview

This document provides comprehensive API documentation for the Karnataka Wool Monitoring System. The system uses Firebase as the backend service with custom service layers for business logic.

## Table of Contents

1. [Authentication Services](#authentication-services)
2. [Firebase Services](#firebase-services)
3. [Wool Quality Services](#wool-quality-services)
4. [QR Code Services](#qr-code-services)
5. [Blockchain Services](#blockchain-services)
6. [Market Data Services](#market-data-services)
7. [Error Handling](#error-handling)
8. [Rate Limiting](#rate-limiting)

## Authentication Services

### authService.jsx

#### signIn(email, password)
Authenticates user with email and password.

**Parameters:**
- `email` (string): User's email address
- `password` (string): User's password

**Returns:**
- `Promise<Object>`: User object with authentication details

**Example:**
```javascript
try {
  const user = await authService.signIn('farmer@example.com', 'password123');
  console.log('User logged in:', user);
} catch (error) {
  console.error('Login failed:', error.message);
}
```

#### signUp(userData)
Creates new user account with role assignment.

**Parameters:**
- `userData` (Object): User registration data
  - `email` (string): User's email
  - `password` (string): User's password
  - `name` (string): User's full name
  - `role` (string): User role (farmer, buyer, government, inspector)
  - `phone` (string): Phone number
  - `address` (string): Physical address

**Returns:**
- `Promise<Object>`: Created user object

**Example:**
```javascript
const userData = {
  email: 'newfarmer@example.com',
  password: 'securePassword123',
  name: 'John Farmer',
  role: 'farmer',
  phone: '+91-9876543210',
  address: 'Village, District, State'
};

try {
  const user = await authService.signUp(userData);
  console.log('User created:', user);
} catch (error) {
  console.error('Registration failed:', error.message);
}
```

#### resetPassword(email)
Sends password reset email to user.

**Parameters:**
- `email` (string): User's email address

**Returns:**
- `Promise<void>`

#### signOut()
Signs out current user and clears session.

**Returns:**
- `Promise<void>`

#### onAuthStateChange(callback)
Listens for authentication state changes.

**Parameters:**
- `callback` (function): Function called when auth state changes

**Returns:**
- `function`: Unsubscribe function

## Firebase Services

### firebaseService.jsx

#### Batch Management

##### createBatch(batchData)
Creates a new wool batch in Firestore.

**Parameters:**
- `batchData` (Object): Batch information
  - `batchName` (string): Name of the batch
  - `farmerName` (string): Farmer's name
  - `farmerId` (string): Farmer's unique ID
  - `weight` (number): Weight in kg
  - `woolType` (string): Type of wool
  - `location` (string): Farm location
  - `coordinates` (string): GPS coordinates
  - `price` (number): Price per kg

**Returns:**
- `Promise<Object>`: Created batch object with generated batchId

**Example:**
```javascript
const batchData = {
  batchName: 'Premium Merino Batch 2024',
  farmerName: 'John Farmer',
  farmerId: 'farmer_123',
  weight: 50,
  woolType: 'Merino',
  location: 'Karnataka, India',
  coordinates: '12.9716,77.5946',
  price: 450
};

try {
  const batch = await firebaseService.createBatch(batchData);
  console.log('Batch created:', batch.batchId);
} catch (error) {
  console.error('Batch creation failed:', error);
}
```

##### getFarmerBatches(farmerId)
Retrieves all batches for a specific farmer.

**Parameters:**
- `farmerId` (string): Farmer's unique identifier

**Returns:**
- `Promise<Array>`: Array of batch objects

##### updateBatch(batchId, updateData)
Updates existing batch information.

**Parameters:**
- `batchId` (string): Batch unique identifier
- `updateData` (Object): Fields to update

**Returns:**
- `Promise<void>`

##### getBatch(batchId)
Retrieves specific batch by ID.

**Parameters:**
- `batchId` (string): Batch unique identifier

**Returns:**
- `Promise<Object>`: Batch object

##### getAllAvailableBatches()
Gets all batches available for purchase.

**Returns:**
- `Promise<Array>`: Array of available batch objects

#### Tracking Management

##### addTrackingEntry(batchId, trackingData)
Adds new tracking entry for batch movement.

**Parameters:**
- `batchId` (string): Batch unique identifier
- `trackingData` (Object): Tracking information
  - `location` (string): Current location
  - `coordinates` (string): GPS coordinates
  - `actor` (string): Person responsible
  - `process` (string): Current process
  - `status` (string): Current status
  - `notes` (string): Additional notes

**Returns:**
- `Promise<Object>`: Created tracking entry

**Example:**
```javascript
const trackingData = {
  location: 'Processing Facility, Bangalore',
  coordinates: '12.9716,77.5946',
  actor: 'Processing Manager',
  process: 'Washing',
  status: 'IN_PROGRESS',
  notes: 'Started washing process'
};

try {
  await firebaseService.addTrackingEntry('BATCH_123', trackingData);
  console.log('Tracking entry added');
} catch (error) {
  console.error('Failed to add tracking:', error);
}
```

##### getTrackingHistory(batchId)
Retrieves complete tracking history for a batch.

**Parameters:**
- `batchId` (string): Batch unique identifier

**Returns:**
- `Promise<Array>`: Array of tracking entries ordered by timestamp

#### Order Management

##### createOrder(orderData)
Creates new purchase order.

**Parameters:**
- `orderData` (Object): Order information
  - `buyerId` (string): Buyer's ID
  - `buyerName` (string): Buyer's name
  - `items` (Array): Array of order items
  - `totalAmount` (number): Total order amount
  - `shippingAddress` (string): Delivery address
  - `paymentMethod` (string): Payment method

**Returns:**
- `Promise<Object>`: Created order with orderId

##### getUserOrders(userType)
Gets orders for specific user type.

**Parameters:**
- `userType` (string): 'buyer' or 'seller'

**Returns:**
- `Promise<Array>`: Array of order objects

## Wool Quality Services

### woolQualityService.jsx

#### saveQualityRecord(qualityData)
Saves quality assessment record for wool batch.

**Parameters:**
- `qualityData` (Object): Quality assessment data
  - `batchId` (string): Batch identifier
  - `micron` (number): Fiber diameter in microns
  - `stapleLength` (number): Fiber length in mm
  - `strength` (string): Fiber strength rating
  - `color` (string): Wool color
  - `moisture` (number): Moisture content percentage
  - `yield` (number): Clean wool yield percentage
  - `inspector` (string): Quality inspector name
  - `grade` (string): Assigned quality grade

**Returns:**
- `Promise<Object>`: Saved quality record

**Example:**
```javascript
const qualityData = {
  batchId: 'BATCH_123',
  micron: 18.5,
  stapleLength: 85,
  strength: 'High',
  color: 'White',
  moisture: 12.5,
  yield: 78.2,
  inspector: 'Dr. Quality Inspector',
  grade: 'A+'
};

try {
  const record = await woolQualityService.saveQualityRecord(qualityData);
  console.log('Quality record saved:', record.id);
} catch (error) {
  console.error('Failed to save quality record:', error);
}
```

#### getQualityRecordByBatch(batchId)
Retrieves quality records for specific batch.

**Parameters:**
- `batchId` (string): Batch unique identifier

**Returns:**
- `Promise<Array>`: Array of quality records

#### calculateQualityScore(qualityData)
Calculates overall quality score based on parameters.

**Parameters:**
- `qualityData` (Object): Quality parameters

**Returns:**
- `number`: Quality score (0-100)

#### assignQualityGrade(score)
Assigns quality grade based on score.

**Parameters:**
- `score` (number): Quality score

**Returns:**
- `string`: Quality grade (A+, A, B, C)

## QR Code Services

### enhancedQRService.jsx

#### generateBatchQR(batchData)
Generates QR code for wool batch with embedded data.

**Parameters:**
- `batchData` (Object): Batch information for QR code
  - `batchId` (string): Batch identifier
  - `farmerId` (string): Farmer ID
  - `farmerName` (string): Farmer name
  - `weight` (number): Batch weight
  - `createdAt` (string): Creation timestamp

**Returns:**
- `Promise<Object>`: QR code data and image

**Example:**
```javascript
const batchData = {
  batchId: 'BATCH_123',
  farmerId: 'farmer_456',
  farmerName: 'John Farmer',
  weight: 50,
  createdAt: new Date().toISOString()
};

try {
  const qrResult = await enhancedQRService.generateBatchQR(batchData);
  console.log('QR Code generated:', qrResult.qrCode);
} catch (error) {
  console.error('QR generation failed:', error);
}
```

#### scanQRCode(qrData)
Processes scanned QR code data.

**Parameters:**
- `qrData` (string): Scanned QR code content

**Returns:**
- `Promise<Object>`: Decoded batch information

#### downloadQRCode(qrCode, filename)
Downloads QR code as image file.

**Parameters:**
- `qrCode` (string): Base64 QR code image
- `filename` (string): Download filename

#### printQRCode(qrCode, batchData)
Prints QR code with batch information.

**Parameters:**
- `qrCode` (string): Base64 QR code image
- `batchData` (Object): Batch information for label

## Blockchain Services

### WoolChain.jsx

#### addWoolBatch(batchData)
Adds wool batch to blockchain for immutable tracking.

**Parameters:**
- `batchData` (Object): Batch information

**Returns:**
- `WoolBlock`: Created blockchain block

#### trackMovement(batchId, fromLocation, toLocation, actor, action, coordinates)
Records batch movement on blockchain.

**Parameters:**
- `batchId` (string): Batch identifier
- `fromLocation` (string): Origin location
- `toLocation` (string): Destination location
- `actor` (string): Responsible person
- `action` (string): Type of movement
- `coordinates` (string): GPS coordinates

**Returns:**
- `WoolBlock`: Created movement block

#### addQualityCheck(batchId, inspector, grade, notes, location, coordinates)
Records quality inspection on blockchain.

**Parameters:**
- `batchId` (string): Batch identifier
- `inspector` (string): Inspector name
- `grade` (string): Quality grade
- `notes` (string): Inspection notes
- `location` (string): Inspection location
- `coordinates` (string): GPS coordinates

**Returns:**
- `WoolBlock`: Created quality check block

#### getBatchHistory(batchId)
Retrieves complete blockchain history for batch.

**Parameters:**
- `batchId` (string): Batch identifier

**Returns:**
- `Array<WoolBlock>`: Array of blockchain blocks

#### isChainValid()
Validates blockchain integrity.

**Returns:**
- `boolean`: True if blockchain is valid

## Market Data Services

### woolPriceService.jsx

#### getChartData(timeRange)
Gets market price chart data for specified time range.

**Parameters:**
- `timeRange` (string): Time period ('last30Days', 'last6Months', etc.)

**Returns:**
- `Object`: Chart.js compatible data object

#### getMarketStats(timeRange)
Gets market statistics for time period.

**Parameters:**
- `timeRange` (string): Time period

**Returns:**
- `Object`: Market statistics including averages, trends

#### getTrendAnalysis(timeRange)
Analyzes market trends for time period.

**Parameters:**
- `timeRange` (string): Time period

**Returns:**
- `Object`: Trend analysis data

### realTimeMarketService.jsx

#### getCommodityPrices()
Gets current commodity prices from external APIs.

**Returns:**
- `Promise<Object>`: Current market prices

#### getGlobalWoolMarketData()
Gets global wool market information.

**Returns:**
- `Promise<Object>`: Global market data

#### connectToRealTimeData(callback)
Establishes real-time market data connection.

**Parameters:**
- `callback` (function): Function called with real-time updates

**Returns:**
- `function`: Disconnect function

## Error Handling

### Standard Error Response Format

All API methods follow consistent error handling:

```javascript
{
  success: false,
  error: {
    code: 'ERROR_CODE',
    message: 'Human readable error message',
    details: 'Additional error details'
  }
}
```

### Common Error Codes

- `AUTH_REQUIRED`: Authentication required
- `PERMISSION_DENIED`: Insufficient permissions
- `BATCH_NOT_FOUND`: Batch ID not found
- `INVALID_DATA`: Invalid input data
- `NETWORK_ERROR`: Network connectivity issue
- `QUOTA_EXCEEDED`: API quota exceeded

### Error Handling Example

```javascript
try {
  const batch = await firebaseService.getBatch(batchId);
  // Handle success
} catch (error) {
  switch (error.code) {
    case 'BATCH_NOT_FOUND':
      console.error('Batch not found');
      break;
    case 'PERMISSION_DENIED':
      console.error('Access denied');
      break;
    default:
      console.error('Unexpected error:', error.message);
  }
}
```

## Rate Limiting

### Firebase Quotas

- **Firestore Reads**: 50,000 per day (free tier)
- **Firestore Writes**: 20,000 per day (free tier)
- **Authentication**: 10,000 verifications per month (free tier)

### Best Practices

1. **Batch Operations**: Group multiple operations when possible
2. **Caching**: Cache frequently accessed data
3. **Pagination**: Use pagination for large datasets
4. **Real-time Listeners**: Use sparingly to avoid quota exhaustion

### Rate Limiting Implementation

```javascript
// Example rate limiting wrapper
const rateLimitedCall = async (apiCall, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await apiCall();
    } catch (error) {
      if (error.code === 'QUOTA_EXCEEDED' && i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        continue;
      }
      throw error;
    }
  }
};
```

## Testing

### Unit Testing Example

```javascript
import { firebaseService } from '../services/firebaseService';

describe('Firebase Service', () => {
  test('should create batch successfully', async () => {
    const batchData = {
      batchName: 'Test Batch',
      farmerName: 'Test Farmer',
      weight: 25,
      woolType: 'Merino'
    };
    
    const result = await firebaseService.createBatch(batchData);
    
    expect(result).toHaveProperty('batchId');
    expect(result.batchName).toBe('Test Batch');
  });
});
```

---

**Last Updated:** December 2024  
**Version:** 1.0.0