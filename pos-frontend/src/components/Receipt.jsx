import React from 'react';

const Receipt = ({ order, cart, customerName = 'Walk-in', paidAmount = 0, change = 0 }) => {
  const subtotal = cart?.reduce((sum, item) => sum + (item.total || 0), 0) || 0;
  const tax = subtotal * 0.10;
  const total = subtotal + tax;

  const formatCurrency = (amount) => {
    return typeof amount === 'number' ? amount.toFixed(2) : '0.00';
  };

  return (
    <div id="receipt-content" className="receipt-print p-4 bg-white text-black font-mono text-sm max-w-[300px] mx-auto">
      {/* Header */}
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold">Your POS Store</h2>
        <p>Thank you for shopping!</p>
        <p>Siem Reap, Cambodia</p>
        <p>{new Date().toLocaleString()}</p>
      </div>

      <hr className="border-dashed border-black my-2" />

      {/* Items */}
      <div className="mb-4">
        {cart?.map(item => (
          <div key={item.id || item.productId} className="flex justify-between mb-1">
            <span>{item.name || 'Product'} x {item.quantity}</span>
            <span>${formatCurrency(item.total)}</span>
          </div>
        ))}
      </div>

      <hr className="border-dashed border-black my-2" />

      {/* Totals */}
      <div className="space-y-1">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>${formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span>Tax (10%):</span>
          <span>${formatCurrency(tax)}</span>
        </div>
        <div className="flex justify-between font-bold text-lg">
          <span>Total:</span>
          <span>${formatCurrency(total)}</span>
        </div>
        <div className="flex justify-between">
          <span>Paid ({order?.paymentMethod || 'Cash'}):</span>
          <span>${formatCurrency(paidAmount)}</span>
        </div>
        <div className="flex justify-between font-bold">
          <span>Change:</span>
          <span>${formatCurrency(change)}</span>
        </div>
      </div>

      <hr className="border-dashed border-black my-4" />

      {/* Footer */}
      <div className="text-center">
        <p>Order #{order?.orderNumber || order?.id || 'N/A'}</p>
        <p>Customer: {customerName}</p>
        <p>Have a great day!</p>
        <p>*** Thank You ***</p>
      </div>

      {/* Cut line simulation */}
      <div className="text-center mt-6">---------------- CUT HERE ----------------</div>
    </div>
  );
};

export default Receipt;