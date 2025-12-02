import { getFirestore, collection, doc, addDoc, updateDoc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { auth } from '../firebase/config.jsx';
import { evaluateIndianGrading } from './indianGradingModel.jsx';

const db = getFirestore();
const COLLECTION = 'wool_quality';

class WoolQualityService {
  _evaluateQuality(data) {
    // Use Indian grading model strictly based on provided parameters
    const result = evaluateIndianGrading({
      micron: data.micron,
      stapleLength: data.stapleLength,
      moisture: data.moisture,
      vegetableMatter: data.vegetableMatter,
      yield: data.yield,
      strength: data.strength,
      color: data.color,
    });
    return { score: result.score, grade: result.grade, indian: result };
  }
  async addQualityRecord(batchId, data) {
    if (!auth.currentUser) throw new Error('Authentication required');
    const userId = auth.currentUser.uid;
    const assessorName = auth.currentUser.displayName || auth.currentUser.email || 'Assessor';
    const evaluated = ('score' in data && 'grade' in data) ? { score: data.score, grade: data.grade } : this._evaluateQuality(data);
    const record = {
      ...data,
      batchId,
      score: evaluated.score,
      grade: evaluated.grade,
      indianModel: evaluated.indian || null,
      assessorName,
      createdBy: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const docRef = await addDoc(collection(db, COLLECTION), record);
    return { id: docRef.id, ...record };
  }

  async saveQualityRecord(qualityData) {
    return this.addQualityRecord(qualityData.batchId, qualityData);
  }

  async updateQualityRecord(recordId, updates) {
    const docRef = doc(db, COLLECTION, recordId);
    await updateDoc(docRef, { ...updates, updatedAt: new Date() });
    const updatedDoc = await getDoc(docRef);
    return { id: recordId, ...updatedDoc.data() };
  }

  async getQualityRecordByBatch(batchId) {
    const q = query(collection(db, COLLECTION), where('batchId', '==', batchId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async getAllQualityRecords() {
    const snapshot = await getDocs(collection(db, COLLECTION));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
}

const woolQualityService = new WoolQualityService();
export default woolQualityService;