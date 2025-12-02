import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import firebaseService from '../services/firebaseService.jsx';
import AuthGuard from '../components/AuthGuard.jsx';

import OrderTrackingSteps from '../components/OrderTrackingSteps.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

const OrderHistory = ({ user }) => {
  const { t } = useLanguage();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    loadOrders();
  }, [user]);

  const loadOrders = async () => {
    try {
      let userOrders;
      if (user?.role === 'farmer') {
        // For farmers, show orders where their batches were sold
        userOrders = await firebaseService.getUserOrders('seller');
      } else {
        // For buyers, show their purchase orders
        userOrders = await firebaseService.getUserOrders('buyer');
      }
      setOrders(userOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
    }
    setLoading(false);
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'warning',
      'confirmed': 'info',
      'shipped': 'primary',
      'delivered': 'success',
      'cancelled': 'danger'
    };
    return colors[status] || 'secondary';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'pending': 'fas fa-clock',
      'confirmed': 'fas fa-check',
      'shipped': 'fas fa-truck',
      'delivered': 'fas fa-box-open',
      'cancelled': 'fas fa-times'
    };
    return icons[status] || 'fas fa-question';
  };

  if (loading) {
    return (
      <div className="container-fluid" style={{padding: 'var(--klwb-spacing-xl)'}}>
        <div className="klwb-detail-card">
          <div className="text-center py-5">
            <div className="spinner-border text-primary mb-3"></div>
            <h5>Loading your orders...</h5>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AuthGuard user={user} showLoginPrompt={true}>
      <div className="container-fluid" style={{padding: 'var(--klwb-spacing-xl) var(--klwb-spacing-lg)'}}>
        <div className="klwb-detail-card mb-4">
          <div className="klwb-detail-header">
            <div className="d-flex justify-content-between align-items-center">
              <h2 className="klwb-detail-title">
                <i className={`fas fa-${user?.role === 'farmer' ? 'chart-line' : 'receipt'} me-2`}></i>
                {user?.role === 'farmer' ? 'Sales Tracking' : 'Order History'}
              </h2>
              <span className="klwb-status-badge klwb-status-approved">
                {orders.length} total {user?.role === 'farmer' ? 'sales' : 'orders'}
              </span>
            </div>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="klwb-detail-card">
            <div className="text-center py-5">
              <i className="fas fa-receipt fa-4x mb-4" style={{color: 'var(--klwb-gray)'}}></i>
              <h5 style={{color: 'var(--klwb-text-muted)'}}>
                {user?.role === 'farmer' ? 'No Sales Yet' : 'No Orders Yet'}
              </h5>
              <p style={{color: 'var(--klwb-text-muted)'}}>
                {user?.role === 'farmer' 
                  ? 'Your sales history will appear here when customers purchase your wool' 
                  : 'Your order history will appear here after making purchases'
                }
              </p>
              {user?.role !== 'farmer' && (
                <Link to="/products" className="klwb-btn-primary">
                  <i className="fas fa-shopping-bag me-2"></i>Start Shopping
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="klwb-detail-card">
            <div className="klwb-detail-header">
              <h5 className="klwb-detail-title">
                <i className="fas fa-list me-2"></i>
                {user?.role === 'farmer' ? 'Sales History' : 'Order List'}
              </h5>
            </div>
            <div className="p-4">
              <div className="row">
                {orders.map(order => (
                  <div key={order.orderId} className="col-12 mb-3">
                    <div className="klwb-detail-card">
                      <div className="p-3">
                        <div className="row align-items-center">
                          <div className="col-md-3">
                            <h6 className="mb-1" style={{color: 'var(--klwb-primary)'}}>
                              Order #{order.orderId?.slice(-8)}
                            </h6>
                            <small className="text-muted">
                              <i className="fas fa-calendar me-1"></i>
                              {new Date(order.createdAt).toLocaleDateString()}
                            </small>
                          </div>
                          <div className="col-md-2">
                            <span className={`klwb-status-badge klwb-status-${getStatusColor(order.status) === 'success' ? 'approved' : getStatusColor(order.status) === 'warning' ? 'pending' : 'processing'}`}>
                              <i className={`${getStatusIcon(order.status)} me-1`}></i>
                              {order.status?.toUpperCase()}
                            </span>
                          </div>
                          <div className="col-md-2">
                            <div className="fw-bold" style={{color: 'var(--klwb-success)'}}>
                              ₹{(order.totalAmount * 75)?.toFixed(0) || '0'}
                            </div>
                            <small className="text-muted">
                              {order.items?.length || 0} item(s)
                            </small>
                          </div>
                          <div className="col-md-3">
                            <small className="text-muted">
                              {order.items?.map(item => item.name).join(', ').substring(0, 50)}
                              {order.items?.map(item => item.name).join(', ').length > 50 && '...'}
                            </small>
                          </div>
                          <div className="col-md-2 text-end">
                            <button
                              className="klwb-btn-secondary btn-sm"
                              onClick={() => setSelectedOrder(order)}
                            >
                              <i className="fas fa-eye me-1"></i>View Details
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  Order Details - #{selectedOrder.orderId?.slice(-8)}
                </h5>
                <button className="btn-close" onClick={() => setSelectedOrder(null)}></button>
              </div>
              <div className="modal-body">
                <div className="row mb-4">
                  <div className="col-md-6">
                    <h6>Order Information</h6>
                    <p><strong>Order ID:</strong> {selectedOrder.orderId}</p>
                    <p><strong>Date:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                    <p><strong>Status:</strong> 
                      <span className={`badge bg-${getStatusColor(selectedOrder.status)} ms-2`}>
                        {selectedOrder.status?.toUpperCase()}
                      </span>
                    </p>
                  </div>
                  <div className="col-md-6">
                    <h6>Shipping Address</h6>
                    <p>{selectedOrder.shippingAddress || 'Not provided'}</p>
                    <p><strong>Payment Method:</strong> {selectedOrder.paymentMethod}</p>
                  </div>
                </div>

                <h6>Order Items</h6>
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items?.map((item, index) => (
                        <tr key={index}>
                          <td>{item.name || item.batchId}</td>
                          <td>${item.price?.toFixed(2) || item.pricePerKg?.toFixed(2)}</td>
                          <td>{item.quantity}</td>
                          <td>${(item.total || item.totalPrice)?.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="row">
                  <div className="col-md-6 offset-md-6">
                    <div className="border-top pt-3">
                      <div className="d-flex justify-content-between">
                        <span>Subtotal:</span>
                        <span>${(selectedOrder.subtotal || selectedOrder.totalAmount)?.toFixed(2)}</span>
                      </div>
                      {selectedOrder.shipping && (
                        <div className="d-flex justify-content-between">
                          <span>Shipping:</span>
                          <span>${selectedOrder.shipping.toFixed(2)}</span>
                        </div>
                      )}
                      {selectedOrder.tax && (
                        <div className="d-flex justify-content-between">
                          <span>Tax:</span>
                          <span>${selectedOrder.tax.toFixed(2)}</span>
                        </div>
                      )}
                      <hr />
                      <div className="d-flex justify-content-between fw-bold">
                        <span>Total:</span>
                        <span className="text-success">${selectedOrder.totalAmount?.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedOrder.notes && (
                  <div className="mt-3">
                    <h6>Order Notes</h6>
                    <p className="text-muted">{selectedOrder.notes}</p>
                  </div>
                )}
                
                {/* Order Tracking */}
                {selectedOrder.items && selectedOrder.items.length > 0 && (
                  <div className="mt-4">
                    <h6>Order Tracking</h6>
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="mb-3 p-3 border rounded">
                        <h6 className="mb-2">{item.name || item.batchId}</h6>
                        <OrderTrackingSteps 
                          orderId={selectedOrder.orderId}
                          batchId={item.batchId}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setSelectedOrder(null)}>
                  Close
                </button>
                {selectedOrder.status === 'delivered' && (
                  <button className="btn btn-primary">
                    <i className="fas fa-star me-1"></i>Leave Review
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </AuthGuard>
  );
};

export default OrderHistory;