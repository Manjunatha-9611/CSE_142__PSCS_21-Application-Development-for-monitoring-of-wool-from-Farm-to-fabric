# Testing Script for Karnataka Wool Monitoring System

## Quick Test Commands

### 1. Test FastAPI CORS Configuration

```bash
# Test health endpoint
curl http://localhost:8000/health | python -m json.tool

# Test CORS preflight
curl -X OPTIONS http://localhost:8000/predict-quality \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v

# Test prediction endpoint
curl -X POST http://localhost:8000/predict-quality \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3000" \
  -d "{\"micron\": 22.5, \"stapleLength\": 75, \"crimp\": \"Medium\", \"strength\": \"Medium\", \"elasticity\": \"Medium\", \"fineness\": \"Medium\"}" \
  | python -m json.tool
```

### 2. Firebase Connection Test

Open browser console on `http://localhost:3000` and run:

```javascript
// Test 1: Check Firebase initialization
console.log('Firebase initialized:', typeof firebase !== 'undefined');

// Test 2: Check cache service
import cacheService from './services/cacheService.jsx';
console.log('Cache stats:', cacheService.getStats());

// Test 3: Test batch fetching with cache
firebaseService.getAllAvailableBatches().then(batches => {
  console.log('First fetch (no cache):', batches.length);
  // Fetch again to test cache
  firebaseService.getAllAvailableBatches().then(batches2 => {
    console.log('Second fetch (should use cache):', batches2.length);
  });
});

// Test 4: Test connection status
import { getConnectionStatus } from './firebase/config.jsx';
console.log('Connection status:', getConnectionStatus());
```

### 3 Test Real-Time Updates

1. Open application in two browser tabs
2. **Tab 1**: Login as farmer, navigate to Traceability
3. **Tab 2**: Login as inspector, navigate to Quality Assessment
4. **Tab 1**: Create a new batch
5. **Tab 2**: Check if batch appears automatically (within 3-5 seconds)
6. **Expected**: Batch appears in Tab 2 without refresh

### 4. Test Map Performance

1. Navigate to Farmer Traceability page
2. Create a batch with at least 5 tracking entries (different locations)
3. Click "Track on Map"
4. **Expected Results**:
   - Map loads in < 2 seconds
   - Route is displayed smoothly
   - First load calculates route, second load uses cache
   - Timeline scrolls smoothly
   - Clicking markers shows popups instantly

### 5. Test Cache Effectiveness

Open browser console and run:

```javascript
// Clear localStorage to test from scratch
localStorage.removeItem('wool_tracking_routes');

// Navigate to map tracking - route will be calculated
// Close and reopen - route should be instant from cache

// Check cache
const cache = localStorage.getItem('wool_tracking_routes');
console.log('Route cache size:', cache ? cache.length : 0, 'characters');
```

## Expected Performance Metrics

### Response Times
- ✅ FastAPI `/health` endpoint: < 50ms
- ✅ FastAPI `/predict-quality`: < 500ms
- ✅ Firebase batch query (first): < 800ms
- ✅ Firebase batch query (cached): < 10ms
- ✅ Map route calculation (first): < 3 seconds
- ✅ Map route from cache: < 100ms

### Real-Time Updates
- ✅ Batch creation appears in inspector dashboard: < 5 seconds
- ✅ Quality update reflects in farmer view: < 5 seconds
- ✅ Marketplace updates when batch listed: < 3 seconds

### Browser Console
- ✅ Zero CORS errors
- ✅ Zero Firebase connection errors
- ✅ Cache hit logs visible: "\u2713 Using cached [resource]"
- ✅ Connection monitoring logs: "\u2713 Firebase Firestore connected"

## Troubleshooting

### CORS Errors
If you see CORS errors:
1. Check that React app is running on `localhost:3000`
2. Check that FastAPI is running on `localhost:8000`
3. Restart FastAPI server: `uvicorn main:app --reload`
4. Clear browser cache and refresh

### Firebase Connection Issues
If you see Firebase errors:
1. Check `.env` file has correct Firebase credentials
2. Check console for connection status messages
3. Test network connection
4. Open browser developer tools → Application → IndexedDB
5. Verify Firestore data is accessible

### Map Not Loading
If map doesn't load:
1. Check browser console for errors
2. Clear route cache: `localStorage.removeItem('wool_tracking_routes')`
3. Verify tracking data has valid coordinates
4. Check network tab for failed OSRM requests

### Slow Performance
If queries are slow:
1. Check cache stats in console: `cacheService.getStats()`
2. Clear cache if needed: `cacheService.invalidate()`
3. Check Firebase console for quota limits
4. Monitor network tab for excessive requests

## Success Checklist

- [ ] No CORS errors in console
- [ ] FastAPI health endpoint responds
- [ ] Quality prediction works
- [ ] Firebase always connected message appears
- [ ] Batches load in < 1 second (after first load)
- [ ] Map routes use cache for repeat views
- [ ] Real-time updates work across tabs
- [ ] No console.error logs during normal usage
- [ ] Cache hit logs appear frequently
- [ ] Auto-reconnect works when going offline/online
