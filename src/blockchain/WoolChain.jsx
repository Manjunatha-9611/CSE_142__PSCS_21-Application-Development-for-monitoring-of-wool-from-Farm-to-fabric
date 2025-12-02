import WoolBlock from './WoolBlock.jsx';

/**
 * WoolChain - Blockchain implementation for wool supply chain traceability
 * 
 * This class implements a custom blockchain specifically designed for tracking
 * wool batches from farm to fabric. Each block contains immutable records of
 * wool batch creation, movement, quality checks, and other supply chain events.
 * 
 * Features:
 * - Immutable tracking of wool batches
 * - Cryptographic proof of authenticity
 * - Complete audit trail for compliance
 * - Decentralized verification system
 */
class WoolChain {
  /**
   * Initialize the blockchain with genesis block
   * 
   * Creates a new blockchain instance starting with the genesis block.
   * Sets mining difficulty and initializes pending transactions array.
   */
  constructor() {
    // Initialize blockchain with genesis block
    this.chain = [this.createGenesisBlock()];
    
    // Mining difficulty (number of leading zeros required in hash)
    this.difficulty = 2;
    
    // Array to store pending transactions before mining
    this.pendingTransactions = [];
  }

  /**
   * Create the first block in the blockchain (Genesis Block)
   * 
   * The genesis block is the foundation of the blockchain and contains
   * initial system information. It has no previous hash reference.
   * 
   * @returns {WoolBlock} The genesis block
   */
  createGenesisBlock() {
    return new WoolBlock(0, Date.now(), {
      type: 'GENESIS',
      message: 'Wool Supply Chain Genesis Block',
      timestamp: new Date().toISOString()
    }, '0');
  }

  /**
   * Get the most recently added block in the chain
   * 
   * @returns {WoolBlock} The latest block in the blockchain
   */
  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  /**
   * Add a new wool batch to the blockchain
   * 
   * Creates an immutable record of a new wool batch creation on the blockchain.
   * This is typically called when a farmer registers a new batch of wool.
   * 
   * @param {Object} batchData - The wool batch information
   * @param {string} batchData.batchId - Unique identifier for the batch
   * @param {string} batchData.farmerName - Name of the farmer creating the batch
   * @param {string} batchData.location - Farm location
   * @param {string} batchData.coordinates - GPS coordinates of the farm
   * @param {number} batchData.weight - Weight of wool in kg
   * @param {string} batchData.woolType - Type of wool (Merino, Romney, etc.)
   * @param {Object} batchData.quality - Quality parameters
   * @param {string} batchData.shearingDate - Date when wool was sheared
   * @returns {WoolBlock} The newly created block containing batch data
   */
  addWoolBatch(batchData) {
    // Prepare block data with batch creation information
    const blockData = {
      type: 'WOOL_BATCH_CREATED',
      batchId: batchData.batchId,
      farmerName: batchData.farmerName,
      farmLocation: batchData.location || batchData.farmLocation,
      coordinates: batchData.coordinates,
      weight: batchData.weight,
      woolType: batchData.woolType,
      quality: batchData.quality,
      shearingDate: batchData.shearingDate,
      timestamp: new Date().toISOString(),
      actor: batchData.farmerName
    };

    // Create new block with batch data
    const newBlock = new WoolBlock(
      this.chain.length,           // Block index
      Date.now(),                  // Timestamp
      blockData,                   // Block data
      this.getLatestBlock().hash   // Previous block hash
    );

    // Mine the block (proof of work)
    newBlock.mineBlock(this.difficulty);
    
    // Add block to chain
    
    return newBlock;
  }

  /**
   * Track movement of wool batch in supply chain
   * 
   * Records the movement of a wool batch from one location to another.
   * This creates an immutable audit trail of the batch's journey through
   * the supply chain from farm to fabric.
   * 
   * @param {string} batchId - Unique identifier of the wool batch
   * @param {string} fromLocation - Starting location of the movement
   * @param {string} toLocation - Destination location
   * @param {string} actor - Person/entity responsible for the movement
   * @param {string} action - Type of action (transport, storage, processing)
   * @param {string} coordinates - GPS coordinates of the new location
   * @returns {WoolBlock} The newly created block containing movement data
   */
  trackMovement(batchId, fromLocation, toLocation, actor, action, coordinates) {
    // Prepare movement tracking data
    const blockData = {
      type: 'MOVEMENT',
      batchId,
      fromLocation,
      toLocation,
      coordinates,
      actor,
      action,
      timestamp: new Date().toISOString()
    };

    // Create new block for movement record
    const newBlock = new WoolBlock(
      this.chain.length,           // Block index
      Date.now(),                  // Timestamp
      blockData,                   // Movement data
      this.getLatestBlock().hash   // Previous block hash
    );

    // Mine the block and add to chain
    newBlock.mineBlock(this.difficulty);
    this.chain.push(newBlock);
    
    return newBlock;
  }

  /**
   * Add quality inspection record to blockchain
   * 
   * Creates an immutable record of quality inspection performed by
   * certified inspectors. This ensures quality grades cannot be
   * tampered with and provides transparency in quality assessment.
   * 
   * @param {string} batchId - Unique identifier of the wool batch
   * @param {string} inspector - Name/ID of the quality inspector
   * @param {string} grade - Quality grade assigned (A+, A, B, etc.)
   * @param {string} notes - Inspector's notes and observations
   * @param {string} location - Location where inspection was conducted
   * @param {string} coordinates - GPS coordinates of inspection location
   * @returns {WoolBlock} The newly created block containing quality data
   */
  addQualityCheck(batchId, inspector, grade, notes, location, coordinates) {
    // Prepare quality inspection data
    const blockData = {
      type: 'QUALITY_CHECK',
      batchId,
      inspector,
      grade,
      notes,
      location,
      coordinates,
      timestamp: new Date().toISOString(),
      actor: inspector
    };

    // Create new block for quality record
    const newBlock = new WoolBlock(
      this.chain.length,           // Block index
      Date.now(),                  // Timestamp
      blockData,                   // Quality inspection data
      this.getLatestBlock().hash   // Previous block hash
    );

    // Mine the block and add to chain
    newBlock.mineBlock(this.difficulty);
    this.chain.push(newBlock);
    
    return newBlock;
  }

  /**
   * Get complete history of a specific wool batch
   * 
   * Retrieves all blockchain records related to a specific batch ID,
   * including creation, movements, quality checks, and other events.
   * 
   * @param {string} batchId - Unique identifier of the wool batch
   * @returns {Array<WoolBlock>} Array of blocks containing batch history
   */
  getBatchHistory(batchId) {
    return this.chain.filter(block => 
      block.data.batchId === batchId
    );
  }

  /**
   * Get all wool batches created on the blockchain
   * 
   * Retrieves all blocks that represent wool batch creation events.
   * Useful for displaying all available batches in the system.
   * 
   * @returns {Array<WoolBlock>} Array of blocks containing batch creation records
   */
  getAllBatches() {
    return this.chain.filter(block => 
      block.data.type === 'WOOL_BATCH_CREATED'
    );
  }

  /**
   * Get geographical tracking path of a wool batch
   * 
   * Extracts location coordinates from batch history to create
   * a geographical path showing the batch's journey through
   * the supply chain for map visualization.
   * 
   * @param {string} batchId - Unique identifier of the wool batch
   * @returns {Array<Object>} Array of location objects with coordinates and metadata
   */
  getTrackingPath(batchId) {
    // Get complete batch history
    const history = this.getBatchHistory(batchId);
    
    // Filter blocks with coordinates and map to location objects
    return history
      .filter(block => block.data.coordinates)
      .map(block => ({
        coordinates: block.data.coordinates,
        location: block.data.farmLocation || block.data.toLocation || block.data.location,
        timestamp: block.data.timestamp,
        type: block.data.type,
        actor: block.data.actor
      }));
  }

  /**
   * Validate the integrity of the entire blockchain
   * 
   * Performs cryptographic validation of the entire chain by:
   * 1. Verifying each block's hash matches its calculated hash
   * 2. Verifying each block's previousHash matches the previous block's hash
   * 
   * This ensures the blockchain hasn't been tampered with.
   * 
   * @returns {boolean} True if blockchain is valid, false if corrupted
   */
  isChainValid() {
    // Start from index 1 (skip genesis block)
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      // Verify current block's hash integrity
      if (currentBlock.hash !== currentBlock.calculateHash()) {
        console.error(`Block ${i} has invalid hash`);
        return false;
      }

      // Verify chain linkage
      if (currentBlock.previousHash !== previousBlock.hash) {
        console.error(`Block ${i} has invalid previous hash`);
        return false;
      }
    }
    
    return true;
  }
}

// Export the WoolChain class for use in other modules
export default WoolChain;