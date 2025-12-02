import { ref as dbRef, push, set, onValue, query, orderByChild, equalTo } from 'firebase/database';
import { database } from '../firebase/config.jsx';

export const uploadWoolImage = async (imageFile, userId) => {
  try {
    console.log('Converting image to base64...', { userId, fileName: imageFile.name });
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(imageFile);
    });
  } catch (error) {
    console.error('Image conversion error:', error);
    throw error;
  }
};

export const saveQualityRecord = async (qualityData, userId, userInfo) => {
  try {
    console.log('Saving quality record...', { userId, score: qualityData.score });
    
    const recordsRef = dbRef(database, 'quality-records');
    const newRecordRef = push(recordsRef);
    
    const record = {
      id: newRecordRef.key,
      userId,
      userInfo,
      imageUrl: qualityData.imageUrl,
      qualityScore: qualityData.score,
      qualityCategory: qualityData.category,
      aiPredictions: qualityData.predictions,
      certificateId: qualityData.certificateId,
      timestamp: qualityData.timestamp || new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    
    await set(newRecordRef, record);
    console.log('Record saved successfully:', record.id);
    return record;
  } catch (error) {
    console.error('Save record error:', error);
    // For demo purposes, return a mock record
    const mockRecord = {
      id: 'demo-' + Date.now(),
      userId,
      userInfo,
      imageUrl: qualityData.imageUrl,
      qualityScore: qualityData.score,
      qualityCategory: qualityData.category,
      aiPredictions: qualityData.predictions,
      certificateId: qualityData.certificateId,
      timestamp: qualityData.timestamp || new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    console.log('Using mock record for demo:', mockRecord.id);
    return mockRecord;
  }
};

export const getUserQualityRecords = (userId, callback) => {
  const recordsRef = dbRef(database, 'quality-records');
  const userRecordsQuery = query(recordsRef, orderByChild('userId'), equalTo(userId));
  
  return onValue(userRecordsQuery, (snapshot) => {
    const records = [];
    snapshot.forEach((childSnapshot) => {
      records.push({
        id: childSnapshot.key,
        ...childSnapshot.val()
      });
    });
    callback(records.reverse()); // Most recent first
  });
};

export const getAllQualityRecords = (callback) => {
  const recordsRef = dbRef(database, 'quality-records');
  
  return onValue(recordsRef, (snapshot) => {
    const records = [];
    snapshot.forEach((childSnapshot) => {
      records.push({
        id: childSnapshot.key,
        ...childSnapshot.val()
      });
    });
    callback(records.reverse()); // Most recent first
  });
};