// app/payment/page.jsx
"use client";
import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ethers } from 'ethers';

const PaymentPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [ethAmount, setEthAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [ethPrice, setEthPrice] = useState(null);

  useEffect(() => {
    const fetchEthPrice = async () => {
      try {
        const response = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd'
        );
        const data = await response.json();
        setEthPrice(data.ethereum.usd);
      } catch (error) {
        console.error('Failed to fetch ETH price:', error);
        setEthPrice(3000);
      }
    };
    fetchEthPrice();
  }, []);

  const investmentData = {
    name: searchParams.get('name') || 'Unknown',
    minimum: Number(searchParams.get('minimum')) || 0,
    returns: searchParams.get('returns') || '0%',
    maturity: searchParams.get('maturity') || '0 years'
  };

  useEffect(() => {
    if (amount && ethPrice) {
      const ethValue = Number(amount) / ethPrice;
      setEthAmount(ethValue.toFixed(6));
    } else {
      setEthAmount(0);
    }
  }, [amount, ethPrice]);

  const contractAddress = '0x4961C6c040D0F99f177bCCeAF05Cf3209701423C';
  const contractABI = [
    {
      "inputs": [
        {"internalType": "enum Investment.InvestmentType", "name": "_type", "type": "uint8"}
      ],
      "name": "subscribe",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    }
  ];

  const getInvestmentType = (name) => {
    switch (name.toLowerCase()) {
      case 'money market': return 0;
      case 'equity': return 1;
      case 'bonds': return 2;
      default: return 0; // Default to MoneyMarket
    }
  };

  const handleNext = () => setStep(step + 1);
  const handleBack = () => step > 1 ? setStep(step - 1) : router.push('/dashboard');
  const handleCancel = () => router.push('/dashboard');

  const handleConfirmPayment = async () => {
    if (paymentMethod === 'metamask' && window.ethereum) {
      setLoading(true);
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0xAA36A7' }],
        });
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(contractAddress, contractABI, signer);
        const investmentType = getInvestmentType(investmentData.name);
        const weiAmount = ethers.parseEther(ethAmount.toString());

        // Debug logging
        console.log('Investment Name:', investmentData.name);
        console.log('Mapped Investment Type:', investmentType);

        const tx = await contract.subscribe(investmentType, { value: weiAmount });
        const receipt = await tx.wait();
        setTxHash(receipt.hash);
        setLoading(false);
        handleNext();
      } catch (error) {
        console.error('Payment failed:', error);
        setLoading(false);
        alert('Payment failed: ' + error.message);
      }
    } else if (paymentMethod === 'stripe') {
      handleNext();
    }
  };

  const renderStep = () => {
    if (!ethPrice) return <div className="p-6 text-center">Loading ETH price...</div>;

    switch (step) {
      case 1:
        return (
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Investment Amount</h2>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount in USD"
              className="w-full p-2 border rounded mb-4"
              min={investmentData.minimum}
            />
            <p className="text-sm mb-4">
              Equivalent in Sepolia ETH: {ethAmount} ETH (1 ETH = ${ethPrice})
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                className="p-2 border rounded flex-1 text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleNext}
                disabled={!amount || Number(amount) < investmentData.minimum}
                className="bg-[#1e3d34] text-white p-2 rounded flex-1 disabled:opacity-50"
              >
                Next
              </button>
            </div>
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
                Metamask (Sepolia Testnet)
              </button>
              <button
                onClick={() => setPaymentMethod('stripe')}
                className={`p-2 flex-1 ${paymentMethod === 'stripe' ? 'bg-[#1e3d34] text-white' : 'bg-gray-200'}`}
              >
                Stripe
              </button>
            </div>
            <div className="flex gap-2">
              <button onClick={handleBack} className="p-2 border rounded flex-1 text-gray-600 hover:bg-gray-100">Back</button>
              <button
                onClick={handleNext}
                disabled={!paymentMethod}
                className="bg-[#1e3d34] text-white p-2 rounded flex-1 disabled:opacity-50"
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
              <p>Amount: ${amount} ({ethAmount} Sepolia ETH)</p>
              <p>Investment: {investmentData.name}</p>
              <p>Payment Method: {paymentMethod}</p>
              <p>Expected Returns: {investmentData.returns}</p>
              <p>Maturity: {investmentData.maturity}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={handleBack} className="p-2 border rounded flex-1 text-gray-600 hover:bg-gray-100">Back</button>
              <button
                onClick={handleConfirmPayment}
                disabled={loading}
                className="bg-[#1e3d34] text-white p-2 rounded flex-1 disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Confirm Payment'}
              </button>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">Investment Successful!</h2>
            <p className="text-gray-600 mb-4">
              Your ${amount} ({ethAmount} Sepolia ETH) investment in {investmentData.name} has been processed successfully.
              Expected returns: {investmentData.returns} over {investmentData.maturity}.
            </p>
            {txHash && (
              <p className="text-sm text-gray-500 mb-4">
                Transaction Hash: <a href={`https://sepolia.etherscan.io/tx/${txHash}`} target="_blank" className="underline">{txHash.slice(0, 10)}...</a>
              </p>
            )}
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-[#1e3d34] text-white p-2 rounded w-full hover:bg-[#2a4d42] transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white rounded-lg w-[500px] shadow-lg relative">
        <button
          onClick={handleCancel}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl font-bold"
          aria-label="Close"
        >
          ✕
        </button>
        {renderStep()}
      </div>
    </div>
  );
};

export default PaymentPage;