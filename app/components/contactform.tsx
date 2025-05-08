import { ethers } from "ethers";
import { useState, useEffect } from "react";

export default function AnalyticsPanel({ provider, account }) {
  const [totalInvested, setTotalInvested] = useState("0");

  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      const investment = new ethers.Contract(
        "INVESTMENT_ADDRESS",
        [
          "function getTotalInvested(address _user) external view returns (uint256)",
          "function getTransactionHistory() external view returns (tuple(address user, uint8 investmentType, uint256 amount, uint256 timestamp)[])",
        ],
        provider
      );
      const total = await investment.getTotalInvested(account);
      setTotalInvested(ethers.formatEther(total));
      const txs = await investment.getTransactionHistory();
      setHistory(
        txs.map((tx) => ({
          type:
            tx.investmentType === 0
              ? "MoneyMarket"
              : tx.investmentType === 1
              ? "Equity"
              : "Bonds",
          amount: ethers.formatEther(tx.amount),
          timestamp: tx.timestamp.toString(),
        }))
      );
    };
    fetchAnalytics();
  }, [provider, account]);

  return (
    <div className="p-10 bg-gray-100">
      <div>Total Invested: {totalInvested} ETH</div>
      <div>Transaction History:</div>
      {history.map((tx, i) => (
        <div key={i}>{`${tx.type}: ${tx.amount} ETH at ${new Date(
          tx.timestamp * 1000
        ).toLocaleString()}`}</div>
      ))}
    </div>
  );
}
