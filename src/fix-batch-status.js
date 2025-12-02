// Run this in browser console to fix existing batch status
async function fixBatchStatus() {
  // This should be run in the browser console where firebaseService is available
  if (typeof firebaseService !== 'undefined') {
    try {
      await firebaseService.updateBatch('NEW_BATCH_1762358995391', {
        status: 'PENDING_QUALITY_CHECK'
      });
      console.log('Batch status updated to PENDING_QUALITY_CHECK');
    } catch (error) {
      console.error('Error updating batch:', error);
    }
  } else {
    console.error('firebaseService not available');
  }
}

// Call the function
fixBatchStatus();