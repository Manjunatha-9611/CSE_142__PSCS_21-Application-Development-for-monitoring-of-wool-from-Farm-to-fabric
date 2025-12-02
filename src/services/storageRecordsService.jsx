import { ref as dbRef, push, set, onValue, query, orderByChild, equalTo } from 'firebase/database';
import { database } from '../firebase/config.jsx';

class StorageRecordsService {
  // Save storage record to Firebase
  async saveStorageRecord(storageData, userId) {
    try {
      const recordsRef = dbRef(database, 'storage-records');
      const newRecordRef = push(recordsRef);
      
      const record = {
        id: newRecordRef.key,
        userId,
        batchId: storageData.batchId,
        warehouseName: storageData.warehouseName,
        location: storageData.location,
        temperature: storageData.temperature,
        humidity: storageData.humidity,
        status: 'Stored',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await set(newRecordRef, record);
      return { success: true, record };
    } catch (error) {
      console.error('Error saving storage record:', error);
      return { success: false, error: error.message };
    }
  }

  // Save processing record to Firebase
  async saveProcessingRecord(processingData, userId) {
    try {
      const recordsRef = dbRef(database, 'processing-records');
      const newRecordRef = push(recordsRef);
      
      const record = {
        id: newRecordRef.key,
        userId,
        batchId: processingData.batchId,
        processType: processingData.processType,
        startDate: processingData.startDate,
        expectedCompletion: processingData.expectedCompletion,
        notes: processingData.notes,
        status: 'In Progress',
        completion: '0%',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await set(newRecordRef, record);
      return { success: true, record };
    } catch (error) {
      console.error('Error saving processing record:', error);
      return { success: false, error: error.message };
    }
  }

  // Get user's storage records
  getUserStorageRecords(userId, callback) {
    try {
      const recordsRef = dbRef(database, 'storage-records');
      const userRecordsQuery = query(recordsRef, orderByChild('userId'), equalTo(userId));
      
      return onValue(userRecordsQuery, (snapshot) => {
        const records = [];
        snapshot.forEach((childSnapshot) => {
          records.push({
            id: childSnapshot.key,
            ...childSnapshot.val()
          });
        });
        callback(records.length > 0 ? records : this.getMockStorageRecords());
      }, (error) => {
        console.error('Error fetching storage records:', error);
        callback(this.getMockStorageRecords());
      });
    } catch (error) {
      console.error('Error setting up storage records listener:', error);
      callback(this.getMockStorageRecords());
    }
  }

  // Get user's processing records
  getUserProcessingRecords(userId, callback) {
    try {
      const recordsRef = dbRef(database, 'processing-records');
      const userRecordsQuery = query(recordsRef, orderByChild('userId'), equalTo(userId));
      
      return onValue(userRecordsQuery, (snapshot) => {
        const records = [];
        snapshot.forEach((childSnapshot) => {
          records.push({
            id: childSnapshot.key,
            ...childSnapshot.val()
          });
        });
        callback(records.length > 0 ? records : this.getMockProcessingRecords());
      }, (error) => {
        console.error('Error fetching processing records:', error);
        callback(this.getMockProcessingRecords());
      });
    } catch (error) {
      console.error('Error setting up processing records listener:', error);
      callback(this.getMockProcessingRecords());
    }
  }

  // Mock data for fallback
  getMockStorageRecords() {
    return [
      {
        id: 'mock-1',
        batchId: 'WB001',
        warehouseName: 'Central Storage A',
        location: 'Sydney',
        temperature: '18°C',
        humidity: '45%',
        status: 'Stored',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'mock-2',
        batchId: 'WB002',
        warehouseName: 'Regional Hub B',
        location: 'Melbourne',
        temperature: '20°C',
        humidity: '42%',
        status: 'In Transit',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
  }

  getMockProcessingRecords() {
    return [
      {
        id: 'mock-p1',
        batchId: 'WB001',
        processType: 'Scouring',
        startDate: '2024-01-20',
        status: 'Completed',
        completion: '100%',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'mock-p2',
        batchId: 'WB001',
        processType: 'Sorting',
        startDate: '2024-01-22',
        status: 'In Progress',
        completion: '75%',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
  }
}

export default new StorageRecordsService();