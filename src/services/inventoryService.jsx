import { firestore as db } from '../firebase/config.jsx';
import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    getDocs,
    query,
    where,
    orderBy,
    onSnapshot,
    Timestamp
} from 'firebase/firestore';

class InventoryService {
    constructor() {
        this.warehousesCollection = 'warehouses';
        this.stockMovementsCollection = 'stockMovements';
        this.alertsCollection = 'inventoryAlerts';
    }

    // ==================== WAREHOUSE MANAGEMENT ====================

    /**
     * Create a new warehouse
     */
    async createWarehouse(warehouseData) {
        try {
            const warehouse = {
                ...warehouseData,
                currentStock: 0,
                stockValue: 0,
                batches: [],
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now()
            };

            const docRef = await addDoc(collection(db, this.warehousesCollection), warehouse);
            return { id: docRef.id, ...warehouse };
        } catch (error) {
            console.error('Error creating warehouse:', error);
            throw error;
        }
    }

    /**
     * Get all warehouses for a user
     */
    async getWarehouses(userId) {
        try {
            const q = query(
                collection(db, this.warehousesCollection),
                where('ownerId', '==', userId),
                orderBy('createdAt', 'desc')
            );

            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error fetching warehouses:', error);
            throw error;
        }
    }

    /**
     * Get all warehouses (for government)
     */
    async getAllWarehouses() {
        try {
            const snapshot = await getDocs(collection(db, this.warehousesCollection));
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error fetching all warehouses:', error);
            throw error;
        }
    }

    /**
     * Update warehouse details
     */
    async updateWarehouse(warehouseId, updateData) {
        try {
            const warehouseRef = doc(db, this.warehousesCollection, warehouseId);
            await updateDoc(warehouseRef, {
                ...updateData,
                updatedAt: Timestamp.now()
            });
            return true;
        } catch (error) {
            console.error('Error updating warehouse:', error);
            throw error;
        }
    }

    /**
     * Delete warehouse
     */
    async deleteWarehouse(warehouseId) {
        try {
            await deleteDoc(doc(db, this.warehousesCollection, warehouseId));
            return true;
        } catch (error) {
            console.error('Error deleting warehouse:', error);
            throw error;
        }
    }

    // ==================== STOCK MANAGEMENT ====================

    /**
     * Add batch to warehouse
     */
    async addBatchToWarehouse(warehouseId, batchData) {
        try {
            const warehouseRef = doc(db, this.warehousesCollection, warehouseId);
            const warehouseSnap = await getDocs(query(collection(db, this.warehousesCollection), where('__name__', '==', warehouseId)));

            if (warehouseSnap.empty) {
                throw new Error('Warehouse not found');
            }

            const warehouse = warehouseSnap.docs[0].data();
            const batches = warehouse.batches || [];

            // Add new batch
            const newBatch = {
                ...batchData,
                addedAt: Timestamp.now()
            };
            batches.push(newBatch);

            // Calculate new totals
            const currentStock = batches.reduce((sum, b) => sum + (b.weight || 0), 0);
            const stockValue = batches.reduce((sum, b) => sum + (b.value || 0), 0);

            await updateDoc(warehouseRef, {
                batches,
                currentStock,
                stockValue,
                updatedAt: Timestamp.now()
            });

            // Record stock movement
            await this.recordStockMovement({
                warehouseId,
                type: 'IN',
                batchId: batchData.batchId,
                quantity: batchData.weight,
                reason: 'Batch added to warehouse',
                timestamp: Timestamp.now()
            });

            // Check for low stock alerts
            await this.checkStockAlerts(warehouseId, currentStock, warehouse.capacity);

            return true;
        } catch (error) {
            console.error('Error adding batch to warehouse:', error);
            throw error;
        }
    }

    /**
     * Remove batch from warehouse
     */
    async removeBatchFromWarehouse(warehouseId, batchId) {
        try {
            const warehouseRef = doc(db, this.warehousesCollection, warehouseId);
            const warehouseSnap = await getDocs(query(collection(db, this.warehousesCollection), where('__name__', '==', warehouseId)));

            if (warehouseSnap.empty) {
                throw new Error('Warehouse not found');
            }

            const warehouse = warehouseSnap.docs[0].data();
            const batches = (warehouse.batches || []).filter(b => b.batchId !== batchId);

            // Calculate new totals
            const currentStock = batches.reduce((sum, b) => sum + (b.weight || 0), 0);
            const stockValue = batches.reduce((sum, b) => sum + (b.value || 0), 0);

            await updateDoc(warehouseRef, {
                batches,
                currentStock,
                stockValue,
                updatedAt: Timestamp.now()
            });

            // Record stock movement
            await this.recordStockMovement({
                warehouseId,
                type: 'OUT',
                batchId,
                reason: 'Batch removed from warehouse',
                timestamp: Timestamp.now()
            });

            return true;
        } catch (error) {
            console.error('Error removing batch from warehouse:', error);
            throw error;
        }
    }

    // ==================== STOCK MOVEMENTS ====================

    /**
     * Record stock movement
     */
    async recordStockMovement(movementData) {
        try {
            await addDoc(collection(db, this.stockMovementsCollection), movementData);
            return true;
        } catch (error) {
            console.error('Error recording stock movement:', error);
            throw error;
        }
    }

    /**
     * Get stock movement history
     */
    async getStockMovements(warehouseId, limit = 50) {
        try {
            const q = query(
                collection(db, this.stockMovementsCollection),
                where('warehouseId', '==', warehouseId),
                orderBy('timestamp', 'desc')
            );

            const snapshot = await getDocs(q);
            return snapshot.docs.slice(0, limit).map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error fetching stock movements:', error);
            return [];
        }
    }

    // ==================== ALERTS ====================

    /**
     * Check and create low stock alerts
     */
    async checkStockAlerts(warehouseId, currentStock, capacity) {
        try {
            const utilizationPercent = (currentStock / capacity) * 100;

            if (utilizationPercent < 20) {
                await this.createAlert({
                    warehouseId,
                    type: 'LOW_STOCK',
                    severity: 'warning',
                    message: `Warehouse stock is below 20% capacity (${utilizationPercent.toFixed(1)}%)`,
                    currentStock,
                    capacity,
                    createdAt: Timestamp.now()
                });
            }
        } catch (error) {
            console.error('Error checking stock alerts:', error);
        }
    }

    /**
     * Create inventory alert
     */
    async createAlert(alertData) {
        try {
            await addDoc(collection(db, this.alertsCollection), alertData);
            return true;
        } catch (error) {
            console.error('Error creating alert:', error);
            throw error;
        }
    }

    /**
     * Get alerts for user
     */
    async getAlerts(userId) {
        try {
            const q = query(
                collection(db, this.alertsCollection),
                where('userId', '==', userId),
                orderBy('createdAt', 'desc')
            );

            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error fetching alerts:', error);
            return [];
        }
    }

    // ==================== REAL-TIME LISTENERS ====================

    /**
     * Subscribe to warehouse updates
     */
    subscribeToWarehouses(userId, callback) {
        const q = query(
            collection(db, this.warehousesCollection),
            where('ownerId', '==', userId)
        );

        return onSnapshot(q, (snapshot) => {
            const warehouses = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            callback(warehouses);
        });
    }

    // ==================== STATISTICS ====================

    /**
     * Get inventory statistics
     */
    async getInventoryStats(userId) {
        try {
            const warehouses = await this.getWarehouses(userId);

            const stats = {
                totalWarehouses: warehouses.length,
                totalStock: warehouses.reduce((sum, w) => sum + (w.currentStock || 0), 0),
                totalValue: warehouses.reduce((sum, w) => sum + (w.stockValue || 0), 0),
                totalCapacity: warehouses.reduce((sum, w) => sum + (w.capacity || 0), 0),
                averageUtilization: 0,
                lowStockWarehouses: 0
            };

            if (stats.totalCapacity > 0) {
                stats.averageUtilization = (stats.totalStock / stats.totalCapacity) * 100;
            }

            stats.lowStockWarehouses = warehouses.filter(w => {
                const utilization = (w.currentStock / w.capacity) * 100;
                return utilization < 20;
            }).length;

            return stats;
        } catch (error) {
            console.error('Error calculating inventory stats:', error);
            return null;
        }
    }
}

const inventoryService = new InventoryService();
export default inventoryService;
