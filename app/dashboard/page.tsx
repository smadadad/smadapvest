"use client";

import { ethers } from "ethers";
import { useState, useEffect } from "react";
import HomeComp from "../components/homeComp";

export default function Dashboard() {
  const [account, setAccount] = useState(null);
  // const [provider, setProvider] = useState(null);
  const [username, setUsername] = useState("");
  const [totalInvested, setTotalInvested] = useState("0");
  const [transactions, setTransactions] = useState([]);

  const USER_REGISTRY_ADDRESS = "0x30473df72d8D0E2B7c320Be68922B46b58dc931b";
  const INVESTMENT_ADDRESS = "0x93F064375ad9F185bf790b871b2e409cc06Ba9f8";
  const USER_REGISTRY_ABI = [
    "function users(address) external view returns (address userAddress, string username, uint256 signupDate, bool isRegistered)",
  ];
  const INVESTMENT_ABI = [
    "function getTotalInvested(address _user) external view returns (uint256)",
    "function getTransactionHistory() external view returns (tuple(address user, uint8 investmentType, uint256 amount, uint256 timestamp)[])",
  ];

  useEffect(() => {
    const connectWallet = async () => {
      if (!window.ethereum) {
        alert("Please install MetaMask!");
        return;
      }

      let provider;
      if (window.ethereum.providers) {
        provider =
          window.ethereum.providers.find((p) => p.isMetaMask) ||
          window.ethereum;
      } else if (window.ethereum.isMetaMask) {
        provider = window.ethereum;
      } else {
        alert("MetaMask not detected!");
        return;
      }

      const ethersProvider = new ethers.BrowserProvider(provider);
      const accounts = await ethersProvider.send("eth_requestAccounts", []);
      setAccount(accounts[0]);
      // setProvider(ethersProvider);

      const userRegistry = new ethers.Contract(
        USER_REGISTRY_ADDRESS,
        USER_REGISTRY_ABI,
        ethersProvider
      );
      const userData = await userRegistry.users(accounts[0]);
      setUsername(userData.username);
      sessionStorage.setItem("username", userData.username);

      const investment = new ethers.Contract(
        INVESTMENT_ADDRESS,
        INVESTMENT_ABI,
        ethersProvider
      );
      const total = await investment.getTotalInvested(accounts[0]);
      setTotalInvested(ethers.formatEther(total));

      const txs = await investment.getTransactionHistory();
      const userTxs = txs
        .filter((tx) => tx.user.toLowerCase() === accounts[0].toLowerCase())
        .map((tx) => ({
          type:
            tx.investmentType === 0
              ? "Money Market"
              : tx.investmentType === 1
              ? "Equity"
              : "Bonds",
          amount: ethers.formatEther(tx.amount),
          timestamp: new Date(tx.timestamp * 1000).toLocaleString(),
        }));
      setTransactions(userTxs);
    };

    connectWallet();
  }, []);

  return (
    <div className="py-7 px-4">
      {account ? (
        <HomeComp
          username={username}
          totalInvested={totalInvested}
          transactions={transactions}
        />
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
}
