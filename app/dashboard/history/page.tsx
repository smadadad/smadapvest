// app/dashboard/transaction-history/page.jsx
"use client";
import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import Link from "next/link";

const TransactionHistory = () => {
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const contractAddress = "0x93F064375ad9F185bf790b871b2e409cc06Ba9f8";
  const contractABI = [
    {
      inputs: [],
      name: "getTransactionHistory",
      outputs: [
        {
          components: [
            { internalType: "address", name: "user", type: "address" },
            {
              internalType: "enum Investment.InvestmentType",
              name: "investmentType",
              type: "uint8",
            }, // Fixed: "investmentType"
            { internalType: "uint256", name: "amount", type: "uint256" },
            { internalType: "uint256", name: "timestamp", type: "uint256" },
          ],
          internalType: "struct Investment.Transaction[]",
          name: "",
          type: "tuple[]",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
  ];

  const investmentTypeToString = (type) => {
    const typeNumber = Number(type);
    switch (typeNumber) {
      case 0:
        return "Money Market";
      case 1:
        return "Equity";
      case 2:
        return "Bonds";
      default:
        return "Unknown";
    }
  };

  const fetchTransactionHistory = async () => {
    if (!window.ethereum) {
      setError("Please install MetaMask to view your transaction history.");
      setLoading(false);
      return;
    }

    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );

      // Ensure on Sepolia Testnet
      const network = await provider.getNetwork();
      if (Number(network.chainId) !== 11155111) {
        // Sepolia chainId
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0xAA36A7" }],
        });
      }

      const history = await contract.getTransactionHistory();
      console.log("Transaction History:", history);
      const formattedHistory = history.map((tx) => ({
        user: tx.user,
        investmentType: investmentTypeToString(tx.investmentType),
        amount: ethers.formatEther(tx.amount),
        timestamp: new Date(Number(tx.timestamp) * 1000).toLocaleString(),
      }));
      console.log("Transaction History:", formattedHistory);
      setTransactionHistory(formattedHistory);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch transaction history:", error);
      setError( 
        "Failed to load transaction history. Ensure MetaMask is connected and on Sepolia Testnet."
      );
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactionHistory();
  }, []);

  return (
    <div className="max-h-screen w-full  bg-gray-100 flex flex-col items-center py-10">
      <div className="bg-white min-h-[77vh] rounded-lg shadow-lg w-full  p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Transaction History</h1>
          <Link href="/dashboard" className="text-blue-500 hover:underline">
            Back to Dashboard
          </Link>
        </div>

        {loading ? (
          <p className="text-center text-gray-500">
            Loading transaction history...
          </p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : transactionHistory.length === 0 ? (
          <p className="text-center text-gray-500">No transactions found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-700">
              <thead className="text-xs uppercase bg-gray-200">
                <tr>
                  <th className="py-3 px-6">Investment Type</th>
                  <th className="py-3 px-6">Amount (ETH)</th>
                  <th className="py-3 px-6">Date</th>
                  <th className="py-3 px-6">User Address</th>
                </tr>
              </thead>
              <tbody>
                {transactionHistory.map((tx, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-4 px-6">{tx.investmentType}</td>
                    <td className="py-4 px-6">{tx.amount}</td>
                    <td className="py-4 px-6">{tx.timestamp}</td>
                    <td className="py-4 px-6">
                      <a
                        href={`https://sepolia.etherscan.io/address/${tx.user}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        {tx.user.slice(0, 6)}...{tx.user.slice(-4)}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionHistory;
