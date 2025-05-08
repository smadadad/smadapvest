// components/InvestmentModal.jsx
"use client";
import React, { useState } from 'react';

const InvestmentModal = ({ isOpen, onClose, investmentData }) => {
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');

  if (!isOpen) return null;

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);
  
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Investment Amount</h2>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full p-2 border rounded mb-4"
              min={investmentData.minimum}
            />
            <button
              onClick={handleNext}
              disabled={!amount || parseFloat(amount) < investmentData.minimum}
              className="bg-[#1e3d34] text-white p-2 rounded w-full"
            >
              Next
            </button>
          </div>
        );
      case 2:
        return (
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
            <div className="flex gap-4 mb-4">
              <button
                onClick={() => setPaymentMethod('metamask')}
                className={`p-2 flex-1 ${paymentMethod === 'metamask' ? 'bg-[#1e3d34] text-white' : 'bg-gray-200'}`}
              >
                Metamask
              </button>
              <button
                onClick={() => setPaymentMethod('stripe')}
                className={`p-2 flex-1 ${paymentMethod === 'stripe' ? 'bg-[#1e3d34] text-white' : 'bg-gray-200'}`}
              >
                Stripe
              </button>
            </div>
            <div className="flex gap-2">
              <button onClick={handleBack} className="p-2 border rounded flex-1">Back</button>
              <button
                onClick={handleNext}
                disabled={!paymentMethod}
                className="bg-[#1e3d34] text-white p-2 rounded flex-1"
              >
                Next
              </button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Investment Summary</h2>
            <div className="mb-4">
              <p>Amount: ${amount}</p>
              <p>Investment: {investmentData.name}</p>
              <p>Payment Method: {paymentMethod}</p>
              <p>Expected Returns: {investmentData.returns}</p>
              <p>Maturity: {investmentData.maturity}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={handleBack} className="p-2 border rounded flex-1">Back</button>
              <button onClick={handleNext} className="bg-[#1e3d34] text-white p-2 rounded flex-1">
                Confirm Payment
              </button>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">Investment Successful!</h2>
            <p className="text-gray-600 mb-4">
              Your ${amount} investment in {investmentData.name} has been processed successfully.
              Expected returns: {investmentData.returns} over {investmentData.maturity}.
            </p>
            <button onClick={onClose} className="bg-[#1e3d34] text-white p-2 rounded w-full">
              Close
            </button>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg w-[400px]">
        {renderStep()}
      </div>
    </div>
  );
};
export default InvestmentModal;