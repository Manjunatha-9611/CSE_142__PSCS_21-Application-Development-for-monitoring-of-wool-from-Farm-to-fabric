import React, { useState } from 'react';

const PaymentGateway = ({ order, onPaymentSuccess, onPaymentError }) => {
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [processing, setProcessing] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });

  const handlePayment = async (e) => {
    e.preventDefault();
    setProcessing(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate success (90% success rate)
      if (Math.random() > 0.1) {
        const paymentResult = {
          transactionId: `TXN${Date.now()}`,
          method: paymentMethod,
          amount: order.total,
          status: 'SUCCESS',
          timestamp: new Date().toISOString()
        };
        onPaymentSuccess(paymentResult);
      } else {
        throw new Error('Payment failed. Please try again.');
      }
    } catch (error) {
      onPaymentError(error.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="payment-gateway">
      <h4><i className="fas fa-credit-card me-2"></i>Payment Details</h4>
      
      <div className="payment-methods mb-4">
        <div className="row">
          <div className="col-md-4">
            <div 
              className={`payment-method ${paymentMethod === 'card' ? 'active' : ''}`}
              onClick={() => setPaymentMethod('card')}
            >
              <i className="fas fa-credit-card"></i>
              <span>Credit/Debit Card</span>
            </div>
          </div>
          <div className="col-md-4">
            <div 
              className={`payment-method ${paymentMethod === 'paypal' ? 'active' : ''}`}
              onClick={() => setPaymentMethod('paypal')}
            >
              <i className="fab fa-paypal"></i>
              <span>PayPal</span>
            </div>
          </div>
          <div className="col-md-4">
            <div 
              className={`payment-method ${paymentMethod === 'crypto' ? 'active' : ''}`}
              onClick={() => setPaymentMethod('crypto')}
            >
              <i className="fab fa-bitcoin"></i>
              <span>Cryptocurrency</span>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handlePayment}>
        {paymentMethod === 'card' && (
          <div className="card-payment">
            <div className="row">
              <div className="col-md-12 mb-3">
                <label className="form-label">Card Number</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="1234 5678 9012 3456"
                  value={cardDetails.number}
                  onChange={(e) => setCardDetails({...cardDetails, number: e.target.value})}
                  required
                />
              </div>
            </div>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Expiry Date</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="MM/YY"
                  value={cardDetails.expiry}
                  onChange={(e) => setCardDetails({...cardDetails, expiry: e.target.value})}
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">CVV</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="123"
                  value={cardDetails.cvv}
                  onChange={(e) => setCardDetails({...cardDetails, cvv: e.target.value})}
                  required
                />
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label">Cardholder Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="John Doe"
                value={cardDetails.name}
                onChange={(e) => setCardDetails({...cardDetails, name: e.target.value})}
                required
              />
            </div>
          </div>
        )}

        {paymentMethod === 'paypal' && (
          <div className="paypal-payment text-center">
            <p>You will be redirected to PayPal to complete your payment.</p>
            <i className="fab fa-paypal fa-3x text-primary"></i>
          </div>
        )}

        {paymentMethod === 'crypto' && (
          <div className="crypto-payment text-center">
            <p>Scan the QR code or copy the wallet address to send payment.</p>
            <div className="crypto-details">
              <p><strong>Amount:</strong> {(order.total / 45000).toFixed(6)} BTC</p>
              <p><strong>Wallet:</strong> 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa</p>
            </div>
          </div>
        )}

        <div className="order-summary mb-4">
          <h5>Order Summary</h5>
          <div className="d-flex justify-content-between">
            <span>Subtotal:</span>
            <span>₹{order.subtotal}</span>
          </div>
          <div className="d-flex justify-content-between">
            <span>Shipping:</span>
            <span>₹{order.shipping}</span>
          </div>
          <div className="d-flex justify-content-between">
            <span>Tax:</span>
            <span>₹{order.tax}</span>
          </div>
          <hr />
          <div className="d-flex justify-content-between fw-bold">
            <span>Total:</span>
            <span>₹{order.total}</span>
          </div>
        </div>

        <button 
          type="submit" 
          className="btn btn-success btn-lg w-100"
          disabled={processing}
        >
          {processing ? (
            <>
              <span className="spinner-border spinner-border-sm me-2"></span>
              Processing Payment...
            </>
          ) : (
            <>
              <i className="fas fa-lock me-2"></i>
              Pay ₹{order.total}
            </>
          )}
        </button>
      </form>

      <div className="security-info mt-3 text-center">
        <small className="text-muted">
          <i className="fas fa-shield-alt me-1"></i>
          Your payment information is secure and encrypted
        </small>
      </div>
    </div>
  );
};

export default PaymentGateway;