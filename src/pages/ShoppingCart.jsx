import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import firebaseService from '../services/firebaseService.jsx';
import AuthGuard from '../components/AuthGuard.jsx';
import PaymentGateway from '../components/PaymentGateway.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

const ShoppingCart = ({ user, cart, setCart }) => {
  useLanguage(); // For language context
  const [loading, setLoading] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [localCart, setLocalCart] = useState([]);
  const [checkoutData, setCheckoutData] = useState({
    shippingAddress: '',
    paymentMethod: 'card',
    notes: ''
  });

  // Load cart from localStorage on component mount
  React.useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('woolCart') || '[]');
    console.log('Loaded cart from localStorage:', savedCart);
    setLocalCart(savedCart);
    if (setCart) setCart(savedCart);
  }, [setCart]);

  const updateQuantity = (productId, quantity) => {
    let newCart;
    if (quantity <= 0) {
      newCart = localCart.filter(item => item.id !== productId);
    } else {
      newCart = localCart.map(item =>
        item.id === productId ? { ...item, quantity } : item
      );
    }
    setLocalCart(newCart);
    localStorage.setItem('woolCart', JSON.stringify(newCart));
  };

  const removeItem = (productId) => {
    const newCart = localCart.filter(item => item.id !== productId);
    setLocalCart(newCart);
    localStorage.setItem('woolCart', JSON.stringify(newCart));
  };

  const subtotal = localCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 100 ? 0 : 15;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const handleCheckout = () => {
    if (!checkoutData.shippingAddress) {
      alert('Please enter shipping address');
      return;
    }
    setShowPayment(true);
  };

  const handlePaymentSuccess = async (paymentResult) => {
    setLoading(true);
    try {
      const orderData = {
        buyerId: user?.uid || user?.id,
        buyerName: user?.name || 'Customer',
        items: localCart.map(item => ({
          productId: item.id,
          batchId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          total: item.price * item.quantity
        })),
        subtotal,
        shipping,
        tax,
        total,
        shippingAddress: checkoutData.shippingAddress,
        paymentMethod: paymentResult.method,
        paymentStatus: 'COMPLETED',
        transactionId: paymentResult.transactionId,
        notes: checkoutData.notes,
        status: 'CONFIRMED'
      };

      const order = await firebaseService.createOrder(orderData);
      
      for (const item of orderData.items) {
        await firebaseService.addTrackingEntry(item.batchId, {
          status: 'SOLD',
          location: 'Marketplace',
          notes: `Sold to ${user.name}`,
          buyerId: user.uid
        });
        
        await firebaseService.addTrackingEntry(item.batchId, {
          status: 'PAYMENT_CONFIRMED',
          location: 'Payment Gateway',
          notes: `Payment confirmed via ${paymentResult.method}`,
          transactionId: paymentResult.transactionId
        });
      }
      
      setLocalCart([]);
      localStorage.removeItem('woolCart');
      setShowCheckout(false);
      setShowPayment(false);
      
      alert(`Order placed successfully! Order ID: ${order.orderId}\nTracking will be updated as your wool is processed.`);
    } catch (error) {
      console.error('Order creation error:', error);
      alert('Payment successful but failed to create order. Please contact support.');
    }
    setLoading(false);
  };

  if (localCart.length === 0) {
    return (
      <div className="container-fluid" style={{padding: 'var(--klwb-spacing-xl)'}}>
        <div className="klwb-detail-card">
          <div className="text-center py-5">
            <i className="fas fa-shopping-cart fa-4x mb-4" style={{color: 'var(--klwb-gray)'}}></i>
            <h5 style={{color: 'var(--klwb-text-muted)'}}>Your Cart is Empty</h5>
            <p style={{color: 'var(--klwb-text-muted)'}}>Add some premium wool products to get started</p>
            <Link to="/products" className="klwb-btn-primary">
              <i className="fas fa-shopping-bag me-2"></i>Continue Shopping
            </Link>
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
            <h2 className="klwb-detail-title">
              <i className="fas fa-shopping-cart me-2"></i>
              Shopping Cart ({localCart.length} items)
            </h2>
          </div>
        </div>

        <div className="row">
          <div className="col-lg-8">
            <div className="klwb-detail-card">
              <div className="klwb-detail-header">
                <h5 className="klwb-detail-title">
                  <i className="fas fa-list me-2"></i>
                  Cart Items
                </h5>
              </div>
              <div className="p-4">
                {localCart.map(item => (
                  <div key={item.id} className="klwb-detail-card mb-3">
                    <div className="p-3">
                      <div className="row align-items-center">
                        <div className="col-md-2">
                          <div className="text-center p-3" style={{background: 'var(--klwb-gray-lighter)', borderRadius: 'var(--klwb-radius-md)'}}>
                            <i className="fas fa-cut fa-2x" style={{color: 'var(--klwb-primary)'}}></i>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <h6 className="mb-1" style={{color: 'var(--klwb-primary)'}}>{item.name}</h6>
                          <p className="text-muted small mb-1">{item.seller}</p>
                          <span className={`klwb-status-badge klwb-status-${item.grade === 'A+' ? 'approved' : 'processing'}`}>
                            {item.grade} Grade
                          </span>
                        </div>
                        <div className="col-md-2">
                          <div className="input-group">
                            <button
                              className="klwb-btn-secondary btn-sm"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              -
                            </button>
                            <input
                              type="number"
                              className="klwb-form-control text-center"
                              value={item.quantity}
                              onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 0)}
                              min="0"
                            />
                            <button
                              className="klwb-btn-secondary btn-sm"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <div className="col-md-2 text-center">
                          <div className="fw-bold" style={{color: 'var(--klwb-success)'}}>₹{item.price}/kg</div>
                        </div>
                        <div className="col-md-2 text-end">
                          <div className="h6 mb-2" style={{color: 'var(--klwb-success)'}}>₹{(item.price * item.quantity).toFixed(0)}</div>
                          <button
                            className="klwb-action-btn klwb-btn-delete"
                            onClick={() => removeItem(item.id)}
                            title="Remove Item"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="klwb-detail-card">
              <div className="klwb-detail-header">
                <h5 className="klwb-detail-title">
                  <i className="fas fa-calculator me-2"></i>
                  Order Summary
                </h5>
              </div>
              <div className="p-4">
                <div className="d-flex justify-content-between mb-2">
                  <span>Subtotal:</span>
                  <span>₹{subtotal.toFixed(0)}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Shipping:</span>
                  <span>{shipping === 0 ? 'FREE' : `₹${shipping.toFixed(0)}`}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Tax:</span>
                  <span>₹{tax.toFixed(0)}</span>
                </div>
                <hr />
                <div className="d-flex justify-content-between mb-3">
                  <strong>Total:</strong>
                  <strong style={{color: 'var(--klwb-success)'}}>₹{total.toFixed(0)}</strong>
                </div>
                
                {shipping > 0 && (
                  <div className="alert alert-info small">
                    <i className="fas fa-info-circle me-2"></i>
                    Free shipping on orders over ₹7,500
                  </div>
                )}

                <button
                  className="klwb-btn-primary w-100"
                  onClick={() => setShowCheckout(true)}
                >
                  <i className="fas fa-credit-card me-2"></i>Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        </div>

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Checkout</h5>
                <button className="btn-close" onClick={() => setShowCheckout(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Shipping Address *</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={checkoutData.shippingAddress}
                    onChange={(e) => setCheckoutData({...checkoutData, shippingAddress: e.target.value})}
                    placeholder="Enter your complete shipping address"
                    required
                  ></textarea>
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Payment Method</label>
                  <select
                    className="form-select"
                    value={checkoutData.paymentMethod}
                    onChange={(e) => setCheckoutData({...checkoutData, paymentMethod: e.target.value})}
                  >
                    <option value="card">Credit/Debit Card</option>
                    <option value="paypal">PayPal</option>
                    <option value="bank">Bank Transfer</option>
                    <option value="crypto">Cryptocurrency</option>
                  </select>
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Order Notes</label>
                  <textarea
                    className="form-control"
                    rows="2"
                    value={checkoutData.notes}
                    onChange={(e) => setCheckoutData({...checkoutData, notes: e.target.value})}
                    placeholder="Any special instructions..."
                  ></textarea>
                </div>

                <div className="bg-light p-3 rounded">
                  <h6>Order Total: <span className="text-success">${total.toFixed(2)}</span></h6>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowCheckout(false)}>
                  Back to Cart
                </button>
                {!showPayment ? (
                  <button
                    className="btn btn-success"
                    onClick={handleCheckout}
                    disabled={loading}
                  >
                    Continue to Payment
                  </button>
                ) : (
                  <div className="w-100">
                    <PaymentGateway
                      order={{ subtotal, shipping, tax, total }}
                      onPaymentSuccess={handlePaymentSuccess}
                      onPaymentError={(error) => alert(`Payment failed: ${error}`)}
                    />
                  </div>
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

export default ShoppingCart;