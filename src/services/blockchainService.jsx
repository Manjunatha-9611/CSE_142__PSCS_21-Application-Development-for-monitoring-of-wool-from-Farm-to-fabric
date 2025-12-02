import WoolChain from '../blockchain/WoolChain.jsx';
import realtimeDbService from './realtimeDbService.jsx';

class BlockchainService {
  constructor() {
    this.woolChain = new WoolChain();
    this.listeners = [];
    this.isInitialized = false;
    setTimeout(() => this.initializeFromRealtimeDb(), 100);
  }

  async initializeFromRealtimeDb() {
    try {
      console.log('Initializing blockchain from Firebase Realtime Database...');
      const result = await realtimeDbService.readData('blockchain');
      if (result.success && result.data) {
        const blocks = Object.values(result.data);
        console.log('Found blockchain data in Firebase:', blocks.length, 'blocks');
        console.log('Block data:', blocks);
        if (blocks.length > 0) {
          this.rebuildChain(blocks);
          console.log('Blockchain rebuilt with', this.woolChain.chain.length, 'blocks');
        }
      } else {
        console.log('No blockchain data in Firebase, starting fresh');
      }
      this.isInitialized = true;
    } catch (error) {
      console.warn('Failed to initialize from Firebase:', error.message);
      this.isInitialized = true;
    }
  }

  rebuildChain(blocks) {
    try {
      blocks.sort((a, b) => a.index - b.index);
      const WoolBlock = require('../blockchain/WoolBlock.jsx').default;
      
      // Clear existing chain except genesis block
      this.woolChain.chain = [this.woolChain.chain[0]];
      
      // Rebuild chain from Firebase data
      blocks.forEach(blockData => {
        if (blockData.index > 0) { // Skip genesis block
          const block = new WoolBlock(
            blockData.index,
            blockData.timestamp,
            blockData.data,
            blockData.previousHash
          );
          block.hash = blockData.hash;
          block.nonce = blockData.nonce || 0;
          this.woolChain.chain.push(block);
        }
      });
      
      console.log('Chain rebuilt successfully with', this.woolChain.chain.length, 'blocks');
    } catch (error) {
      console.error('Error rebuilding chain:', error);
    }
  }

  async saveBlockToRealtimeDb(block) {
    try {
      await realtimeDbService.writeData(`blockchain/block_${block.index}`, {
        index: block.index,
        timestamp: block.timestamp,
        data: block.data,
        previousHash: block.previousHash,
        hash: block.hash,
        nonce: block.nonce
      });
      console.log('Block saved to Firebase:', block.index);
    } catch (error) {
      console.error('Failed to save block to Firebase:', error);
    }
  }

  async createWoolBatch(batchData, userId) {
    try {
      const block = this.woolChain.addWoolBatch(batchData);
      await this.saveBlockToRealtimeDb(block);
      
      const batchKey = `batch_${Date.now()}`;
      await realtimeDbService.writeData(`woolBatches/${batchKey}`, {
        ...batchData,
        userId: userId,
        userEmail: batchData.farmerName, // Store email for easier filtering
        blockHash: block.hash,
        blockIndex: block.index,
        createdAt: new Date().toISOString()
      });

      return { success: true, block, batchId: batchData.batchId };
    } catch (error) {
      console.error('Error creating wool batch in blockchain:', error);
      return { success: false, error: error.message };
    }
  }

  async trackMovement(batchId, fromLocation, toLocation, actor, action, coordinates, userId) {
    try {
      const block = this.woolChain.trackMovement(batchId, fromLocation, toLocation, actor, action, coordinates);
      await this.saveBlockToRealtimeDb(block);
      
      const movementKey = `movement_${Date.now()}`;
      await realtimeDbService.writeData(`batchMovements/${movementKey}`, {
        batchId,
        fromLocation,
        toLocation,
        coordinates,
        actor,
        action,
        userId: userId,
        blockHash: block.hash,
        blockIndex: block.index,
        timestamp: new Date().toISOString()
      });

      return { success: true, block };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async addQualityCheck(batchId, inspector, grade, notes, location, coordinates, userId) {
    try {
      const block = this.woolChain.addQualityCheck(batchId, inspector, grade, notes, location, coordinates);
      await this.saveBlockToRealtimeDb(block);
      
      const checkKey = `quality_${Date.now()}`;
      await realtimeDbService.writeData(`qualityChecks/${checkKey}`, {
        batchId,
        inspector,
        grade,
        notes,
        location,
        coordinates,
        userId: userId,
        blockHash: block.hash,
        blockIndex: block.index,
        timestamp: new Date().toISOString()
      });

      return { success: true, block };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  getBatchHistory(batchId) {
    const history = this.woolChain.getBatchHistory(batchId);
    return {
      success: true,
      history: history.map(block => ({
        blockIndex: block.index,
        timestamp: block.data.timestamp,
        type: block.data.type,
        data: block.data,
        hash: block.hash
      }))
    };
  }

  getTrackingPath(batchId) {
    return {
      success: true,
      path: this.woolChain.getTrackingPath(batchId)
    };
  }

  getAllBatches(userRole, userId) {
    try {
      console.log('Getting all batches for user:', userId, 'role:', userRole);
      console.log('Current chain length:', this.woolChain.chain.length);
      
      const batches = this.woolChain.getAllBatches();
      console.log('Raw batches from chain:', batches.length);
      
      let filteredBatches = batches.map(block => {
        console.log('Processing block:', block.index, block.data);
        return block.data;
      });
      
      console.log('All batch data:', filteredBatches);
      
      // For now, show all batches to all users for demo purposes
      // In production, implement proper filtering based on ownership/permissions
      console.log('Showing all', filteredBatches.length, 'batches to user role:', userRole);
      
      return {
        success: true,
        batches: filteredBatches
      };
    } catch (error) {
      console.error('Error getting batches:', error);
      return {
        success: false,
        batches: [],
        error: error.message
      };
    }
  }

  getBlockchainStats() {
    return {
      totalBlocks: this.woolChain.chain.length,
      isValid: this.woolChain.isChainValid(),
      difficulty: this.woolChain.difficulty,
      lastBlock: this.woolChain.getLatestBlock()
    };
  }

  subscribeToUpdates(callback) {
    const dbRef = realtimeDbService.listenToData('blockchain', (snapshot) => {
      const data = snapshot.val();
      if (data) {
        callback(Object.values(data));
      }
    });
    this.listeners.push(dbRef);
    return dbRef;
  }

  cleanup() {
    this.listeners.forEach(dbRef => {
      realtimeDbService.stopListening(dbRef);
    });
    this.listeners = [];
  }
}

const blockchainService = new BlockchainService();
export default blockchainService;