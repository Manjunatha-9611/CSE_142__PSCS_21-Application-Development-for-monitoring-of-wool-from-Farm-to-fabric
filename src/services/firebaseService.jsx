import { database, auth } from '../firebase/config.jsx';
import { ref, push, set, get, update, off, onValue } from 'firebase/database';
import { getFirestore, collection, addDoc, updateDoc, getDocs, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase/config.jsx';
import cacheService from './cacheService.jsx';

const db = getFirestore();

// Debounce utility for real-time listeners
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

class FirebaseService {
  constructor() {
    // Active real-time listeners
    this.activeListeners = new Map();
  }

  // Authentication
  async signIn(email, password) {
    if (!email || !password) throw new Error('Email and password required');
    return await signInWithEmailAndPassword(auth, email, password);
  }

  async signUp(email, password) {
    if (!email || !password) throw new Error('Email and password required');
    return await createUserWithEmailAndPassword(auth, email, password);
  }

  async signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    return await signInWithPopup(auth, provider);
  }



  async signOut() {
    return await signOut(auth);
  }

  async sendPasswordResetEmail(email) {
    const { sendPasswordResetEmail } = await import('firebase/auth');
    return await sendPasswordResetEmail(auth, email);
  }

  onAuthStateChanged(callback) {
    return onAuthStateChanged(auth, callback);
  }

  getCurrentUser() {
    return auth.currentUser;
  }

  // User Profile Management
  async createUserProfile(userId, profileData) {
    const docRef = await addDoc(collection(db, 'users'), {
      userId,
      ...profileData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return docRef.id;
  }

  async getUserProfile(userId) {
    const q = query(collection(db, 'users'), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.empty ? null : snapshot.docs[0].data();
  }

  async updateUserProfile(userId, updates) {
    const q = query(collection(db, 'users'), where('userId', '==', userId));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const docRef = snapshot.docs[0].ref;
      await updateDoc(docRef, { ...updates, updatedAt: new Date() });
    } else {
      await this.createUserProfile(userId, updates);
    }
  }

  // Storage
  async uploadImage(file, path) {
    if (!file) return null;

    try {
      const imageRef = storageRef(storage, path);
      const snapshot = await uploadBytes(imageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      return url;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }

  // Batch Management
  async createBatch(batchData) {
    if (!auth.currentUser) {
      throw new Error('Authentication required');
    }

    if (!batchData.farmerName || !batchData.batchName) {
      throw new Error('Farmer name and batch name are required');
    }

    const userId = auth.currentUser.uid;

    // Generate unique batch ID with batch name
    const timestamp = Date.now();
    const batchId = `${batchData.batchName.replace(/\s+/g, '_').toUpperCase()}_${timestamp}`;

    const batch = {
      ...batchData,
      batchId,
      farmerId: userId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      status: 'REGISTERED',
      trackingHistory: [],
      qualityAssessments: [],
      rejectionReason: ''
    };

    await addDoc(collection(db, 'batches'), batch);

    // Also add to blockchain for traceability
    try {
      const { default: blockchainService } = await import('./blockchainService.jsx');
      await blockchainService.createWoolBatch(batch, userId);
    } catch (blockchainError) {
      console.warn('Blockchain integration failed:', blockchainError);
      // Continue without blockchain - batch is still created in Firestore
    }

    // Add initial tracking entry
    try {
      await this.addTrackingEntry(batchId, {
        location: batchData.location,
        coordinates: batchData.coordinates || '0,0',
        process: 'Batch Created',
        status: 'REGISTERED',
        notes: 'Initial batch registration - awaiting quality assessment',
        actor: batchData.farmerName
      });
    } catch (trackingError) {
      console.warn('Failed to add initial tracking:', trackingError);
    }

    return { batchId, ...batch };
  }

  async updateBatch(batchId, updates) {
    if (!auth.currentUser) {
      throw new Error('Authentication required');
    }

    try {
      // Get all batches and find the one with matching batchId
      const snapshot = await getDocs(collection(db, 'batches'));
      const batchDoc = snapshot.docs.find(doc => doc.data().batchId === batchId);

      if (!batchDoc) {
        console.warn(`No batch found with batchId: ${batchId}`);
        return;
      }

      // Update the document
      await updateDoc(batchDoc.ref, {
        ...updates,
        updatedAt: Date.now()
      });

      console.log(`Batch ${batchId} updated successfully`);

    } catch (error) {
      console.error('Error updating batch:', error);
      throw error;
    }
  }

  async getBatch(batchId) {
    // Check cache first
    const cacheKey = cacheService.generateKey('batch', { batchId });
    const cached = cacheService.get(cacheKey);
    if (cached) return cached;

    try {
      const batchesRef = collection(db, 'batches');
      const snapshot = await getDocs(batchesRef);
      const batchDoc = snapshot.docs.find(doc => doc.data().batchId === batchId);

      if (!batchDoc) {
        return null;
      }

      const result = { id: batchDoc.id, ...batchDoc.data() };

      // Cache the result for 5 minutes
      cacheService.set(cacheKey, result, 5 * 60 * 1000);

      return result;

    } catch (error) {
      console.warn('Firebase connection error:', error);
      return null;
    }
  }

  async getFarmerBatches(farmerId = null) {
    if (!auth.currentUser) {
      throw new Error('Authentication required');
    }

    const userId = farmerId || auth.currentUser.uid;

    // Check cache
    const cacheKey = cacheService.generateKey('farmerBatches', { userId });
    const cached = cacheService.get(cacheKey);
    if (cached) return cached;

    try {
      const batchesRef = collection(db, 'batches');
      const snapshot = await getDocs(batchesRef);
      const allBatches = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const result = allBatches.filter(batch => batch.farmerId === userId);

      // Cache for 2 minutes (shorter TTL for frequently changing data)
      cacheService.set(cacheKey, result, 2 * 60 * 1000);

      return result;
    } catch (error) {
      console.warn('Firestore connection failed:', error);
      return [];
    }
  }

  async getBatchesByStatus(status) {
    try {
      const batchesRef = collection(db, 'batches');
      const snapshot = await getDocs(batchesRef);
      const allBatches = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return allBatches.filter(batch => batch.status === status);
    } catch (error) {
      console.warn('Firestore connection failed, using offline mode:', error);
      return [];
    }
  }



  // Tracking Management
  async addTrackingEntry(batchId, trackingData) {
    const trackingRef = ref(database, `tracking/${batchId}`);
    const newEntryRef = push(trackingRef);

    const entry = {
      ...trackingData,
      timestamp: Date.now(),
      entryId: newEntryRef.key
    };

    await set(newEntryRef, entry);

    // Update batch location but preserve status if it's pending quality check
    const batch = await this.getBatch(batchId);
    const updateData = {
      currentLocation: trackingData.location
    };

    // Only update status if batch is not pending quality check
    if (batch && batch.status !== 'PENDING_QUALITY_CHECK') {
      updateData.status = trackingData.status || 'IN_TRANSIT';
    }

    await this.updateBatch(batchId, updateData);

    return entry;
  }

  async getTrackingHistory(batchId) {
    const trackingRef = ref(database, `tracking/${batchId}`);
    const snapshot = await get(trackingRef);

    if (!snapshot.exists()) return [];

    const tracking = [];
    snapshot.forEach(child => {
      tracking.push(child.val());
    });

    return tracking.sort((a, b) => a.timestamp - b.timestamp);
  }

  // Quality Assessment
  async saveQualityAssessment(batchId, qualityData) {
    // Validate required fields
    if (!qualityData.assessorId || !qualityData.assessorName) {
      throw new Error('Assessor ID and name are required');
    }

    const qualityRef = ref(database, `quality/${batchId}`);
    const newAssessmentRef = push(qualityRef);

    const assessment = {
      ...qualityData,
      assessmentId: newAssessmentRef.key,
      timestamp: Date.now(),
      batchId: batchId
    };

    await set(newAssessmentRef, assessment);

    // Update batch with latest quality grade
    if (auth.currentUser) {
      await this.updateBatch(batchId, {
        qualityGrade: qualityData.grade,
        qualityScore: qualityData.score,
        lastAssessment: Date.now()
      });
    }

    return assessment;
  }

  async getQualityAssessments(batchId) {
    const qualityRef = ref(database, `quality/${batchId}`);
    const snapshot = await get(qualityRef);

    if (!snapshot.exists()) return [];

    const assessments = [];
    snapshot.forEach(child => {
      assessments.push(child.val());
    });

    return assessments.sort((a, b) => b.timestamp - a.timestamp);
  }

  // Certificate Management
  async saveCertificate(certificateData) {
    const certRef = ref(database, 'certificates');
    const newCertRef = push(certRef);

    const certificate = {
      ...certificateData,
      certificateId: newCertRef.key,
      issuedAt: Date.now()
    };

    await set(newCertRef, certificate);
    return certificate;
  }

  async getCertificate(certificateId) {
    const certRef = ref(database, `certificates/${certificateId}`);
    const snapshot = await get(certRef);
    return snapshot.exists() ? snapshot.val() : null;
  }

  // Order Tracking
  async addOrderTracking(orderId, trackingData) {
    const trackingRef = ref(database, `orderTracking/${orderId}`);
    const newEntryRef = push(trackingRef);

    const entry = {
      ...trackingData,
      timestamp: Date.now(),
      entryId: newEntryRef.key
    };

    await set(newEntryRef, entry);
    return entry;
  }

  async getOrderTracking(orderId) {
    const trackingRef = ref(database, `orderTracking/${orderId}`);
    const snapshot = await get(trackingRef);

    if (!snapshot.exists()) return [];

    const tracking = [];
    snapshot.forEach(child => {
      tracking.push(child.val());
    });

    return tracking.sort((a, b) => a.timestamp - b.timestamp);
  }

  // Orders Management
  // Storage & Processing Management
  async saveStorageRecord(storageData, userId) {
    try {
      const record = {
        ...storageData,
        userId,
        recordId: `ST_${Date.now()}`,
        createdAt: Date.now(),
        status: 'Stored'
      };

      await addDoc(collection(db, 'storageRecords'), record);
      return { success: true, record };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getUserStorageRecords(userId) {
    try {
      const snapshot = await getDocs(collection(db, 'storageRecords'));
      const allRecords = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return allRecords.filter(record => record.userId === userId);
    } catch (error) {
      console.warn('Error loading storage records:', error);
      return [];
    }
  }

  async saveProcessingRecord(processingData, userId) {
    try {
      const record = {
        ...processingData,
        userId,
        recordId: `PR_${Date.now()}`,
        createdAt: Date.now(),
        status: 'In Progress',
        completion: '25%'
      };

      await addDoc(collection(db, 'processingRecords'), record);
      return { success: true, record };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getUserProcessingRecords(userId) {
    try {
      const snapshot = await getDocs(collection(db, 'processingRecords'));
      const allRecords = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return allRecords.filter(record => record.userId === userId);
    } catch (error) {
      console.warn('Error loading processing records:', error);
      return [];
    }
  }

  // Training Management
  async enrollInCourse(courseId, userId) {
    try {
      const enrollment = {
        courseId,
        userId,
        enrolledAt: Date.now(),
        progress: 0,
        status: 'ENROLLED'
      };

      await addDoc(collection(db, 'courseEnrollments'), enrollment);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getUserEnrollments(userId) {
    try {
      const snapshot = await getDocs(collection(db, 'courseEnrollments'));
      const allEnrollments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return allEnrollments.filter(enrollment => enrollment.userId === userId);
    } catch (error) {
      console.warn('Error loading enrollments:', error);
      return [];
    }
  }

  async createOrder(orderData) {
    if (!auth.currentUser) {
      throw new Error('Authentication required');
    }

    const userId = auth.currentUser.uid;

    const order = {
      ...orderData,
      buyerId: userId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      status: 'PENDING',
      trackingNumber: `TRK${Date.now()}`,
      paymentStatus: 'PENDING'
    };

    const docRef = await addDoc(collection(db, 'orders'), order);
    const orderId = docRef.id;

    await updateDoc(docRef, { orderId });

    // Update batch status and add tracking
    if (orderData.items && orderData.items.length > 0) {
      for (const item of orderData.items) {
        if (item.batchId) {
          await this.updateBatch(item.batchId, {
            status: 'SOLD',
            soldTo: userId,
            soldDate: new Date(),
            orderId: orderId
          });
        }
      }
    }

    // Add initial order tracking entries
    await this.addOrderTracking(orderId, {
      status: 'ORDER_PLACED',
      location: 'Online Marketplace',
      notes: 'Order successfully placed'
    });

    await this.addOrderTracking(orderId, {
      status: 'PAYMENT_CONFIRMED',
      location: 'Payment Gateway',
      notes: 'Payment processed successfully'
    });

    // Add processing status after a delay (simulate real processing)
    setTimeout(async () => {
      try {
        await this.addOrderTracking(orderId, {
          status: 'PROCESSING',
          location: 'Processing Center',
          notes: 'Order is being processed'
        });
      } catch (error) {
        console.error('Error adding processing tracking:', error);
      }
    }, 2000);

    return { orderId, ...order };
  }

  async updateOrderStatus(orderId, status, updates = {}) {
    const orderRef = ref(database, `orders/${orderId}`);
    await update(orderRef, {
      status,
      ...updates,
      updatedAt: Date.now()
    });
  }

  async getUserOrders(role = 'buyer') {
    if (!auth.currentUser) {
      return [];
    }

    const userId = auth.currentUser.uid;

    try {
      const snapshot = await getDocs(collection(db, 'orders'));
      const allOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      if (role === 'buyer') {
        return allOrders.filter(order => order.buyerId === userId);
      } else {
        return allOrders.filter(order => order.sellerId === userId);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
  }



  // Marketplace
  async getAllAvailableBatches() {
    // Check cache for frequently accessed marketplace data
    const cacheKey = cacheService.generateKey('allBatches', {});
    const cached = cacheService.get(cacheKey);
    if (cached) {
      console.log('✓ Using cached batches');
      return cached;
    }

    try {
      const snapshot = await getDocs(collection(db, 'batches'));
      const batches = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log('All batches from Firebase:', batches);

      // Cache for 1 minute (marketplace data changes frequently)
      cacheService.set(cacheKey, batches, 60 * 1000);

      return batches;
    } catch (error) {
      console.error('Error fetching batches:', error);
      return [];
    }
  }

  /**
   * Subscribe to real-time batch updates with debouncing
   * @param {string} farmerId - Optional farmer ID to filter batches
   * @param {function} callback - Callback function to receive updates
   * @returns {function} Unsubscribe function
   */
  subscribeToFarmerBatches(farmerId, callback) {
    const userId = farmerId || (auth.currentUser && auth.currentUser.uid);
    if (!userId) {
      console.warn('No user ID provided for batch subscription');
      return () => { };
    }

    const listenerKey = `farmerBatches:${userId}`;

    // Remove existing listener if any
    if (this.activeListeners.has(listenerKey)) {
      this.activeListeners.get(listenerKey)();
    }

    // Create debounced callback to prevent excessive updates
    const debouncedCallback = debounce((batches) => {
      console.log(`✓ Real-time update: ${batches.length} batches`);
      // Invalidate cache when real-time update comes
      cacheService.invalidate(`farmerBatches:${userId}`);
      callback(batches);
    }, 500); // 500ms debounce

    try {
      const q = query(collection(db, 'batches'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const allBatches = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const userBatches = allBatches.filter(batch => batch.farmerId === userId);
        debouncedCallback(userBatches);
      }, (error) => {
        console.error('Batch subscription error:', error);
      });

      // Store the unsubscribe function
      this.activeListeners.set(listenerKey, unsubscribe);

      return unsubscribe;
    } catch (error) {
      console.error('Failed to create batch subscription:', error);
      return () => { };
    }
  }

  /**
   * Subscribe to all batches for marketplace
   */
  subscribeToAllBatches(callback) {
    const listenerKey = 'allBatches';

    if (this.activeListeners.has(listenerKey)) {
      this.activeListeners.get(listenerKey)();
    }

    const debouncedCallback = debounce((batches) => {
      console.log(`✓ Marketplace update: ${batches.length} batches`);
      cacheService.invalidate('allBatches');
      callback(batches);
    }, 500);

    try {
      const q = query(collection(db, 'batches'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const batches = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        debouncedCallback(batches);
      }, (error) => {
        console.error('All batches subscription error:', error);
      });

      this.activeListeners.set(listenerKey, unsubscribe);
      return unsubscribe;
    } catch (error) {
      console.error('Failed to create all batches subscription:', error);
      return () => { };
    }
  }

  /**
   * Unsubscribe from specific listener
   */
  unsubscribe(listenerKey) {
    if (this.activeListeners.has(listenerKey)) {
      this.activeListeners.get(listenerKey)();
      this.activeListeners.delete(listenerKey);
      console.log(`✓ Unsubscribed from ${listenerKey}`);
    }
  }

  /**
   * Cleanup all active listeners
   */
  cleanupAllListeners() {
    for (const [key, unsubscribe] of this.activeListeners.entries()) {
      unsubscribe();
      console.log(`✓ Cleaned up listener: ${key}`);
    }
    this.activeListeners.clear();
  }

  async getBatchesByStatus(status) {
    try {
      const snapshot = await getDocs(collection(db, 'batches'));
      const allBatches = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return allBatches.filter(batch => batch.status === status);
    } catch (error) {
      console.error('Error fetching batches by status:', error);
      return [];
    }
  }



  // Processing Requests Management
  async createProcessingRequest(requestData) {
    if (!auth.currentUser) {
      throw new Error('Authentication required');
    }

    const userId = auth.currentUser.uid;

    const request = {
      ...requestData,
      userId: userId,
      requestId: `PR-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'PENDING'
    };

    const docRef = await addDoc(collection(db, 'processingRequests'), request);
    return { requestId: request.requestId, ...request };
  }

  async getUserProcessingRequests(userId = null) {
    if (!auth.currentUser) {
      return [];
    }

    const currentUserId = userId || auth.currentUser.uid;

    try {
      const q = query(
        collection(db, 'processingRequests'),
        where('userId', '==', currentUserId),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching processing requests:', error);
      return [];
    }
  }

  async updateProcessingRequest(requestId, updates) {
    try {
      const q = query(
        collection(db, 'processingRequests'),
        where('requestId', '==', requestId)
      );

      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const docRef = snapshot.docs[0].ref;
        await updateDoc(docRef, {
          ...updates,
          updatedAt: new Date()
        });
      }
    } catch (error) {
      console.error('Error updating processing request:', error);
      throw error;
    }
  }

  // Batch Tracking Management
  async addBatchTrackingEntry(trackingData) {
    if (!auth.currentUser) {
      throw new Error('Authentication required');
    }

    const userId = auth.currentUser.uid;

    const entry = {
      ...trackingData,
      userId: userId,
      entryId: `TRK-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Add to Firestore
    const docRef = await addDoc(collection(db, 'trackingEntries'), entry);

    // Also add to Realtime Database for real-time updates
    const realtimeRef = ref(database, `tracking/${trackingData.batchId}/${entry.entryId}`);
    await set(realtimeRef, entry);

    return { entryId: entry.entryId, ...entry };
  }

  async getBatchTrackingHistory(batchId) {
    try {
      // Get from Firestore
      const q = query(
        collection(db, 'trackingEntries'),
        where('batchId', '==', batchId),
        orderBy('timestamp', 'desc')
      );

      const snapshot = await getDocs(q);
      const firestoreData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Also get from Realtime Database
      const realtimeRef = ref(database, `tracking/${batchId}`);
      const realtimeSnapshot = await get(realtimeRef);
      const realtimeData = realtimeSnapshot.exists() ? Object.values(realtimeSnapshot.val()) : [];

      // Merge and deduplicate
      const allData = [...firestoreData, ...realtimeData];
      const uniqueData = allData.filter((entry, index, self) =>
        index === self.findIndex(e => e.entryId === entry.entryId)
      );

      return uniqueData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } catch (error) {
      console.error('Error fetching tracking history:', error);
      return [];
    }
  }

  async getBatchById(batchId) {
    try {
      const q = query(
        collection(db, 'batches'),
        where('batchId', '==', batchId)
      );

      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
      }
      return null;
    } catch (error) {
      console.error('Error fetching batch:', error);
      return null;
    }
  }

  async updateBatchStatus(batchId, updates) {
    try {
      const q = query(
        collection(db, 'batches'),
        where('batchId', '==', batchId)
      );

      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const docRef = snapshot.docs[0].ref;
        await updateDoc(docRef, {
          ...updates,
          updatedAt: new Date()
        });
      }
    } catch (error) {
      console.error('Error updating batch status:', error);
      throw error;
    }
  }

  // Real-time tracking listener
  subscribeToBatchTracking(batchId, callback) {
    const trackingRef = ref(database, `tracking/${batchId}`);

    const unsubscribe = onValue(trackingRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = Object.values(snapshot.val());
        callback(data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
      } else {
        callback([]);
      }
    });

    return unsubscribe;
  }

  // Cleanup
  off(reference) {
    off(reference);
  }
}

const firebaseService = new FirebaseService();
export default firebaseService;