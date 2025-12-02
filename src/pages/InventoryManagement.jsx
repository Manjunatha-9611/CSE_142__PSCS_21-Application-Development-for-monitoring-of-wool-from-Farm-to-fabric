import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext.jsx';
import inventoryService from '../services/inventoryService.jsx';

const InventoryManagement = ({ user }) => {
    const { t } = useLanguage();
    const [warehouses, setWarehouses] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showAddWarehouse, setShowAddWarehouse] = useState(false);
    const [selectedWarehouse, setSelectedWarehouse] = useState(null);
    const [showAddBatch, setShowAddBatch] = useState(false);

    // Form states
    const [warehouseForm, setWarehouseForm] = useState({
        name: '',
        location: '',
        capacity: '',
        description: ''
    });

    const [batchForm, setBatchForm] = useState({
        batchId: '',
        weight: '',
        value: '',
        woolType: '',
        quality: ''
    });

    useEffect(() => {
        loadData();
    }, [user]);

    const loadData = async () => {
        try {
            setLoading(true);

            if (user.role === 'government') {
                const allWarehouses = await inventoryService.getAllWarehouses();
                setWarehouses(allWarehouses);
            } else {
                const userWarehouses = await inventoryService.getWarehouses(user.uid);
                setWarehouses(userWarehouses);
            }

            if (user.role !== 'government') {
                const statistics = await inventoryService.getInventoryStats(user.uid);
                setStats(statistics);
            }
        } catch (error) {
            console.error('Error loading inventory data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateWarehouse = async (e) => {
        e.preventDefault();

        try {
            await inventoryService.createWarehouse({
                ...warehouseForm,
                ownerId: user.uid,
                ownerName: user.displayName || user.email,
                capacity: parseFloat(warehouseForm.capacity)
            });

            setShowAddWarehouse(false);
            setWarehouseForm({ name: '', location: '', capacity: '', description: '' });
            loadData();
        } catch (error) {
            console.error('Error creating warehouse:', error);
            alert(t('failedToCreateWarehouse'));
        }
    };

    const handleAddBatch = async (e) => {
        e.preventDefault();

        if (!selectedWarehouse) return;

        try {
            await inventoryService.addBatchToWarehouse(selectedWarehouse.id, {
                ...batchForm,
                weight: parseFloat(batchForm.weight),
                value: parseFloat(batchForm.value)
            });

            setShowAddBatch(false);
            setBatchForm({ batchId: '', weight: '', value: '', woolType: '', quality: '' });
            setSelectedWarehouse(null);
            loadData();
        } catch (error) {
            console.error('Error adding batch:', error);
            alert(t('failedToAddBatch'));
        }
    };

    const handleDeleteWarehouse = async (warehouseId) => {
        if (!window.confirm(t('confirmDeleteWarehouse'))) return;

        try {
            await inventoryService.deleteWarehouse(warehouseId);
            loadData();
        } catch (error) {
            console.error('Error deleting warehouse:', error);
            alert(t('failedToDeleteWarehouse'));
        }
    };

    if (loading) {
        return (
            <div className="container-fluid" style={{ padding: 'var(--klwb-spacing-xl)' }}>
                <div className="text-center py-5">
                    <div className="spinner-border text-primary mb-3" role="status"></div>
                    <h5>{t('loadingInventory')}</h5>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid" style={{ padding: 'var(--klwb-spacing-xl) var(--klwb-spacing-lg)' }}>
            {/* Header */}
            <div className="klwb-detail-card mb-4">
                <div className="klwb-detail-header">
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h2 className="klwb-detail-title">
                                <i className="fas fa-warehouse me-2"></i>
                                {t('inventoryManagement')}
                            </h2>
                            <p className="mb-0 text-muted">{t('inventorySubtitle')}</p>
                        </div>
                        {user.role === 'farmer' && (
                            <button
                                className="klwb-btn-primary"
                                onClick={() => setShowAddWarehouse(true)}
                            >
                                <i className="fas fa-plus me-2"></i>
                                {t('addWarehouse')}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Statistics Cards */}
            {stats && user.role === 'farmer' && (
                <div className="row mb-4">
                    <div className="col-md-3 mb-3">
                        <div className="card bg-primary text-white border-0">
                            <div className="card-body text-center py-4">
                                <i className="fas fa-warehouse fa-2x mb-3"></i>
                                <h3 className="mb-1">{stats.totalWarehouses}</h3>
                                <small>{t('totalWarehouses')}</small>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3 mb-3">
                        <div className="card bg-success text-white border-0">
                            <div className="card-body text-center py-4">
                                <i className="fas fa-weight fa-2x mb-3"></i>
                                <h3 className="mb-1">{stats.totalStock.toFixed(1)} kg</h3>
                                <small>{t('totalStock')}</small>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3 mb-3">
                        <div className="card bg-info text-white border-0">
                            <div className="card-body text-center py-4">
                                <i className="fas fa-dollar-sign fa-2x mb-3"></i>
                                <h3 className="mb-1">₹{stats.totalValue.toLocaleString()}</h3>
                                <small>{t('totalValue')}</small>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3 mb-3">
                        <div className="card bg-warning text-white border-0">
                            <div className="card-body text-center py-4">
                                <i className="fas fa-chart-line fa-2x mb-3"></i>
                                <h3 className="mb-1">{stats.averageUtilization.toFixed(1)}%</h3>
                                <small>{t('avgUtilization')}</small>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Warehouses List */}
            <div className="row">
                {warehouses.length === 0 ? (
                    <div className="col-12">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body text-center py-5">
                                <i className="fas fa-warehouse fa-3x text-muted mb-3"></i>
                                <h5 className="text-muted">{t('noWarehousesFound')}</h5>
                                <p className="text-muted">{t('createFirstWarehouse')}</p>
                                {user.role === 'farmer' && (
                                    <button
                                        className="klwb-btn-primary mt-3"
                                        onClick={() => setShowAddWarehouse(true)}
                                    >
                                        <i className="fas fa-plus me-2"></i>
                                        {t('addWarehouse')}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    warehouses.map((warehouse) => {
                        const utilization = warehouse.capacity > 0
                            ? (warehouse.currentStock / warehouse.capacity) * 100
                            : 0;
                        const isLowStock = utilization < 20;

                        return (
                            <div key={warehouse.id} className="col-md-6 col-lg-4 mb-4">
                                <div className="card border-0 shadow-sm h-100">
                                    <div className="card-header bg-gradient-primary text-white">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <h5 className="mb-0">
                                                <i className="fas fa-warehouse me-2"></i>
                                                {warehouse.name}
                                            </h5>
                                            {isLowStock && (
                                                <span className="badge bg-warning">
                                                    <i className="fas fa-exclamation-triangle me-1"></i>
                                                    {t('lowStock')}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="card-body">
                                        <div className="mb-3">
                                            <small className="text-muted">
                                                <i className="fas fa-map-marker-alt me-1"></i>
                                                {warehouse.location}
                                            </small>
                                        </div>

                                        <div className="mb-3">
                                            <div className="d-flex justify-content-between mb-1">
                                                <span>{t('capacityUtilization')}</span>
                                                <strong>{utilization.toFixed(1)}%</strong>
                                            </div>
                                            <div className="progress">
                                                <div
                                                    className={`progress-bar ${isLowStock ? 'bg-warning' : 'bg-success'}`}
                                                    style={{ width: `${utilization}%` }}
                                                ></div>
                                            </div>
                                            <small className="text-muted">
                                                {warehouse.currentStock.toFixed(1)} / {warehouse.capacity} kg
                                            </small>
                                        </div>

                                        <div className="mb-3">
                                            <div className="d-flex justify-content-between">
                                                <span>{t('stockValue')}:</span>
                                                <strong>₹{warehouse.stockValue?.toLocaleString() || 0}</strong>
                                            </div>
                                            <div className="d-flex justify-content-between">
                                                <span>{t('totalBatches')}:</span>
                                                <strong>{warehouse.batches?.length || 0}</strong>
                                            </div>
                                        </div>

                                        {warehouse.description && (
                                            <p className="text-muted small mb-3">{warehouse.description}</p>
                                        )}

                                        {user.role === 'farmer' && (
                                            <div className="btn-group w-100">
                                                <button
                                                    className="btn btn-sm btn-outline-primary"
                                                    onClick={() => {
                                                        setSelectedWarehouse(warehouse);
                                                        setShowAddBatch(true);
                                                    }}
                                                >
                                                    <i className="fas fa-plus me-1"></i>
                                                    {t('addBatch')}
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() => handleDeleteWarehouse(warehouse.id)}
                                                >
                                                    <i className="fas fa-trash me-1"></i>
                                                    {t('delete')}
                                                </button>
                                            </div>
                                        )}

                                        {user.role === 'government' && (
                                            <div className="mt-2">
                                                <small className="text-muted">
                                                    {t('owner')}: {warehouse.ownerName}
                                                </small>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Add Warehouse Modal */}
            {showAddWarehouse && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    <i className="fas fa-warehouse me-2"></i>
                                    {t('addNewWarehouse')}
                                </h5>
                                <button
                                    className="btn-close"
                                    onClick={() => setShowAddWarehouse(false)}
                                ></button>
                            </div>
                            <form onSubmit={handleCreateWarehouse}>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label">{t('warehouseName')} *</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={warehouseForm.name}
                                            onChange={(e) => setWarehouseForm({ ...warehouseForm, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">{t('location')} *</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={warehouseForm.location}
                                            onChange={(e) => setWarehouseForm({ ...warehouseForm, location: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">{t('capacity')} (kg) *</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={warehouseForm.capacity}
                                            onChange={(e) => setWarehouseForm({ ...warehouseForm, capacity: e.target.value })}
                                            required
                                            min="1"
                                            step="0.1"
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">{t('description')}</label>
                                        <textarea
                                            className="form-control"
                                            rows="3"
                                            value={warehouseForm.description}
                                            onChange={(e) => setWarehouseForm({ ...warehouseForm, description: e.target.value })}
                                        ></textarea>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setShowAddWarehouse(false)}
                                    >
                                        {t('cancel')}
                                    </button>
                                    <button type="submit" className="klwb-btn-primary">
                                        <i className="fas fa-save me-2"></i>
                                        {t('createWarehouse')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Batch Modal */}
            {showAddBatch && selectedWarehouse && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    <i className="fas fa-box me-2"></i>
                                    {t('addBatchTo')} {selectedWarehouse.name}
                                </h5>
                                <button
                                    className="btn-close"
                                    onClick={() => {
                                        setShowAddBatch(false);
                                        setSelectedWarehouse(null);
                                    }}
                                ></button>
                            </div>
                            <form onSubmit={handleAddBatch}>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label">{t('batchId')} *</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={batchForm.batchId}
                                            onChange={(e) => setBatchForm({ ...batchForm, batchId: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">{t('weight')} (kg) *</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={batchForm.weight}
                                            onChange={(e) => setBatchForm({ ...batchForm, weight: e.target.value })}
                                            required
                                            min="0.1"
                                            step="0.1"
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">{t('value')} (₹) *</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={batchForm.value}
                                            onChange={(e) => setBatchForm({ ...batchForm, value: e.target.value })}
                                            required
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">{t('woolType')} *</label>
                                        <select
                                            className="form-control"
                                            value={batchForm.woolType}
                                            onChange={(e) => setBatchForm({ ...batchForm, woolType: e.target.value })}
                                            required
                                        >
                                            <option value="">{t('selectType')}</option>
                                            <option value="fine">{t('fineWool')}</option>
                                            <option value="medium">{t('mediumWool')}</option>
                                            <option value="coarse">{t('coarseWool')}</option>
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">{t('qualityGrade')} *</label>
                                        <select
                                            className="form-control"
                                            value={batchForm.quality}
                                            onChange={(e) => setBatchForm({ ...batchForm, quality: e.target.value })}
                                            required
                                        >
                                            <option value="">{t('selectGrade')}</option>
                                            <option value="A">{t('gradeAPremium')}</option>
                                            <option value="B">{t('gradeBGood')}</option>
                                            <option value="C">{t('gradeCStandard')}</option>
                                            <option value="D">{t('gradeDBelowStandard')}</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => {
                                            setShowAddBatch(false);
                                            setSelectedWarehouse(null);
                                        }}
                                    >
                                        {t('cancel')}
                                    </button>
                                    <button type="submit" className="klwb-btn-primary">
                                        <i className="fas fa-save me-2"></i>
                                        {t('addBatch')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InventoryManagement;
