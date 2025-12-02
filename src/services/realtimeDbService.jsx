import { database } from '../firebase/config.jsx';
import { ref, set, get, push, update, remove, onValue, off } from 'firebase/database';

// Helper: recursively sanitize undefined to null for Firebase
function sanitizeForFirebase(obj) {
  if (Array.isArray(obj)) {
    return obj.map(sanitizeForFirebase);
  } else if (obj && typeof obj === 'object') {
    const sanitized = {};
    for (const [k, v] of Object.entries(obj)) {
      if (v === undefined) {
        sanitized[k] = null;
      } else {
        sanitized[k] = sanitizeForFirebase(v);
      }
    }
    return sanitized;
  }
  return obj;
}

class RealtimeDbService {
  // Write data to a specific path
  async writeData(path, data) {
    try {
      const dbRef = ref(database, path);
      await set(dbRef, sanitizeForFirebase(data));
      return { success: true };
    } catch (error) {
      console.error('Error writing data:', error);
      return { success: false, error: error.message };
    }
  }

  // Read data from a specific path
  async readData(path) {
    try {
      if (!database) {
        throw new Error('Database not initialized');
      }
      const dbRef = ref(database, path);
      const snapshot = await get(dbRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        console.log(`Successfully read data from ${path}:`, Object.keys(data || {}).length, 'items');
        return { success: true, data };
      } else {
        console.log(`No data found at path: ${path}`);
        return { success: true, data: null };
      }
    } catch (error) {
      console.error('Error reading data from Firebase:', error);
      return { success: false, error: error.message };
    }
  }

  // Push new data (auto-generated key)
  async pushData(path, data) {
    try {
      const dbRef = ref(database, path);
      const newRef = push(dbRef);
      await set(newRef, sanitizeForFirebase(data));
      return { success: true, key: newRef.key };
    } catch (error) {
      console.error('Error pushing data:', error);
      return { success: false, error: error.message };
    }
  }

  // Update specific fields
  async updateData(path, updates) {
    try {
      const dbRef = ref(database, path);
      await update(dbRef, updates);
      return { success: true };
    } catch (error) {
      console.error('Error updating data:', error);
      return { success: false, error: error.message };
    }
  }

  // Delete data
  async deleteData(path) {
    try {
      const dbRef = ref(database, path);
      await remove(dbRef);
      return { success: true };
    } catch (error) {
      console.error('Error deleting data:', error);
      return { success: false, error: error.message };
    }
  }

  // Listen to data changes
  listenToData(path, callback) {
    const dbRef = ref(database, path);
    onValue(dbRef, callback);
    return dbRef;
  }

  // Stop listening
  stopListening(dbRef, callback) {
    off(dbRef, 'value', callback);
  }
}

const realtimeDbService = new RealtimeDbService();
export default realtimeDbService;