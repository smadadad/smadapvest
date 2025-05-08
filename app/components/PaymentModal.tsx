"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ethers } from "ethers";
import Modal from "./Modal";
import { motion } from "motion/react";

const PaymentModal = ({ onClose, investmentData }:{onClose:()=>void,investmentData:[]}) => {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [ethAmount, setEthAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [ethPrice, setEthPrice] = useState(0);
  const [tokenAmount, setTokenAmount] = useState(0);
  // const [account, setAccount] = useState(null);

  useEffect(() => {
    const fetchEthPrice = async () => {
      try {
        const response = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
        );
        const data = await response.json();
        setEthPrice(data.ethereum.usd);
      } catch (error) {
        console.error("Failed to fetch ETH price:", error);
        setEthPrice(3000); // Fallback
      }
    };
    fetchEthPrice();
  }, []);

  useEffect(() => {
    if (amount && ethPrice) {
      const ethValue = Number(amount) / ethPrice;
      setEthAmount(ethValue.toFixed(6));
      setTokenAmount((ethValue * 100).toFixed(2)); // 1 ETH = 100 tokens
    } else {
      setEthAmount(0);
      setTokenAmount(0);
    }
  }, [amount, ethPrice]);

  const contractAddress = "0x93F064375ad9F185bf790b871b2e409cc06Ba9f8"; // Update with new Investment contract address
  const contractABI = [
    {
      inputs: [
        {
          internalType: "enum Investment.InvestmentType",
          name: "_type",
          type: "uint8",
        },
      ],
      name: "subscribe",
      outputs: [],
      stateMutability: "payable",
      type: "function",
    },
  ];

  // Token ABI to check balance
  // const tokenABI = [
  //   {
  //     inputs: [{ internalType: "address", name: "account", type: "address" }],
  //     name: "balanceOf",
  //     outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
  //     stateMutability: "view",
  //     type: "function",
  //   },
  //   {
  //     inputs: [],
  //     name: "symbol",
  //     outputs: [{ internalType: "string", name: "", type: "string" }],
  //     stateMutability: "view",
  //     type: "function",
  //   },
  // ];

  // // Token addresses (update after deploying InvestmentToken)
  // const tokenAddresses = {
  //   "money market": "0xeCa75Cd41cA3BB6A08Fa2EA460dA1E25dc8CED6C", // Replace
  //   equity: "0x056399753796B8EeCCCBf08730d37A6899E867CB", // Replace
  //   bonds: "0xc0c47e4A910704e3eDDB042CFeC63d191a9791e5", // Replace
  // };

  const getInvestmentType = (name:string) => {
    switch (name.toLowerCase()) {
      case "money market":
        return 0;
      case "equity":
        return 1;
      case "bonds":
        return 2;
      default:
        return 0; // Default to MoneyMarket
    }
  };

  const getTokenSymbol = (name:string) => {
    switch (name.toLowerCase()) {
      case "money market":
        return "MMS";
      case "equity":
        return "EQUITY";
      case "bonds":
        return "BOND";
      default:
        return "TOKEN";
    }
  };

  const handleNext = () => setStep(step + 1);
  const handleBack = () => (step > 1 ? setStep(step - 1) : onClose());
  const handleCancel = () => {
    onClose();
  };

  const handleConfirmPayment = async () => {
    if (paymentMethod === "metamask" && window.ethereum) {
      setLoading(true);
      try {
       
        // setAccount(accounts[0]);
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0xAA36A7" }], // Sepolia
        });
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        const investmentType = getInvestmentType(investmentData.name);
        const weiAmount = ethers.parseEther(ethAmount.toString());

        const tx = await contract.subscribe(investmentType, {
          value: weiAmount,
        });
        const receipt = await tx.wait();
        setTxHash(receipt.hash);
        setLoading(false);
        handleNext();
      } catch (error) {
        console.error("Payment failed:", error);
        setLoading(false);
        alert("Payment failed: " + error.message);
      }
    } else if (paymentMethod === "stripe") {
      handleNext();
    }
  };

  const renderStep = () => {
    if (!ethPrice)
      return (
        <div className="p-6 poppins text-center">Loading ETH price...</div>
      );

    switch (step) {
      case 1:
        return (
          <div className="p-6 poppins">
            <h2 className="text-xl font-semibold mb-4">Investment Amount</h2>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount in USD"
              className="w-full outline-none p-2 border rounded mb-4"
              min={investmentData.minimum}
            />
            <p className="text-sm mb-4">
              Equivalent in Sepolia ETH: {ethAmount} ETH (1 ETH = ${ethPrice})
            </p>
            <p className="text-sm mb-4">
              You will receive: {tokenAmount}{" "}
              {getTokenSymbol(investmentData.name)} tokens
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                className="p-2 border rounded flex-1 text-gray-600 hover:bg-gray-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleNext}
                disabled={!amount || Number(amount) < investmentData.minimum}
                className="bg-[#1e3d34] text-white p-2 rounded flex-1 disabled:opacity-50 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="p-6 poppins">
            <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
            <div className="flex gap-4 mb-4">
              <button
                onClick={() => setPaymentMethod("metamask")}
                className={`p-2 flex-1 ${
                  paymentMethod === "metamask"
                    ? "bg-[#1e3d34] text-white"
                    : "bg-gray-200"
                }`}
              >
                Metamask (Sepolia Testnet)
              </button>
              <button
                onClick={() => setPaymentMethod("stripe")}
                className={`p-2 flex-1 ${
                  paymentMethod === "stripe"
                    ? "bg-[#1e3d34] text-white"
                    : "bg-gray-200"
                }`}
              >
                Stripe
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleBack}
                className="p-2 border rounded flex-1 text-gray-600 hover:bg-gray-100 cursor-pointer"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                disabled={!paymentMethod}
                className="bg-[#1e3d34] text-white p-2 rounded flex-1 disabled:opacity-50 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="p-6 poppins">
            <h2 className="text-xl font-semibold mb-4">Investment Summary</h2>
            <div className="mb-4">
              <p>
                Amount: ${amount} ({ethAmount} Sepolia ETH)
              </p>
              <p>Investment: {investmentData.name}</p>
              <p>
                Tokens: {tokenAmount} {getTokenSymbol(investmentData.name)}
              </p>
              <p>Payment Method: {paymentMethod}</p>
              <p>Expected Returns: {investmentData.returns}</p>
              <p>Maturity: {investmentData.maturity}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleBack}
                className="p-2 border rounded flex-1 text-gray-600 hover:bg-gray-100 cursor-pointer"
              >
                Back
              </button>
              <button
                onClick={handleConfirmPayment}
                disabled={loading}
                className="bg-[#1e3d34] text-white p-2 rounded flex-1 disabled:opacity-50 cursor-pointer"
              >
                {loading ? "Processing..." : "Confirm Payment"}
              </button>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="p-6 poppins text-center montserrat">
            <h2 className="text-xl font-semibold mb-4">
              Investment Successful!
            </h2>
            <p className="text-gray-600 mb-4">
              Your ${amount} ({ethAmount} Sepolia ETH) investment in{" "}
              {investmentData.name} has been processed successfully. You
              received {tokenAmount} {getTokenSymbol(investmentData.name)}{" "}
              tokens.
            </p>
            {txHash && (
              <p className="text-sm text-gray-500 mb-4">
                Transaction Hash:{" "}
                <a
                  href={`https://sepolia.etherscan.io/tx/${txHash}`}
                  target="_blank"
                  className="underline"
                >
                  {txHash.slice(0, 10)}...
                </a>
              </p>
            )}
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={() => router.push("/dashboard")}
              className="bg-[#1e3d34] cursor-pointer text-white p-2 rounded mt-4"
            >
              Go to Dashboard
            </motion.button>
          </div>
        );
      default:
        return <div className="p-6 poppins text-center">Invalid step</div>;
    }
  };

  return <Modal onClose={onClose}>{renderStep()}</Modal>;
};

export default PaymentModal;
