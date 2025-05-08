"use client";

import { ethers } from "ethers";
import { useState, useEffect } from "react";
import Image from "next/image";
import ETH from "@/assets/eth.svg";
import USDC from "@/assets/usdc.svg";
import ArrowRight from "@/assets/arrow-right-white.svg";
import SEND from "@/assets/send.svg";
import RECEIVE from "@/assets/recieve.svg";
import { motion } from "motion/react";
import HTMLContent from "@/app/components/HtmlContent";
import WalletModal from "@/app/components/WalletModal";
import toast from "react-hot-toast";
import DotLoader from "@/app/components/DotLoader";
import Link from "next/link"; // Added for the redeem button link

// Wallet contract ABI
const WALLET_ABI = [
  "function depositEth() external payable",
  "function withdrawEth(uint256 _amount) external",
  "function transferEth(address payable _to, uint256 _amount) external",
  "function getEthBalance(address _user) external view returns (uint256)",
  "function depositUsdt(uint256 _amount) external",
  "function withdrawUsdt(uint256 _amount) external",
  "function transferUsdt(address _to, uint256 _amount) external",
  "function getUsdtBalance(address _user) external view returns (uint256)",
  "function getTransactionHistory(address _user) external view returns (tuple(string transactionType, address token, uint256 amount, address from, address to, uint256 timestamp)[])",
  "event EthDeposited(address indexed user, uint256 amount)",
  "event EthWithdrawn(address indexed user, uint256 amount)",
  "event EthTransferred(address indexed from, address indexed to, uint256 amount)",
  "event UsdtDeposited(address indexed user, uint256 amount)",
  "event UsdtWithdrawn(address indexed user, uint256 amount)",
  "event UsdtTransferred(address indexed from, address indexed to, uint256 amount)",
];

// Investment contract ABI
const INVESTMENT_ABI = [
  {
    inputs: [{ internalType: "address", name: "_user", type: "address" }],
    name: "getTotalInvested",
    outputs: [
      { internalType: "uint256", name: "", type: "uint256" },
      { internalType: "uint256", name: "", type: "uint256" },
      { internalType: "uint256", name: "", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
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
          },
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

// ERC20 ABI for USDT and tokens
const ERC20_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function decimals() external view returns (uint8)",
  "function balanceOf(address account) external view returns (uint256)",
  "function symbol() external view returns (string)",
];

// Contract addresses
const WALLET_ADDRESS = "0x003a2A222f6E6da5A5AAbF742591CF86De5642c6";
const USDT_ADDRESS = "0x7C69e8B0915a97372A2304348e6B1A1bdBEadceC";
const INVESTMENT_ADDRESS = "0x93F064375ad9F185bf790b871b2e409cc06Ba9f8";
const TOKEN_ADDRESSES = {
  bond: "0xc0c47e4A910704e3eDDB042CFeC63d191a9791e5",
  moneyMarket: "0xeCa75Cd41cA3BB6A08Fa2EA460dA1E25dc8CED6C",
  equity: "0x056399753796B8EeCCCBf08730d37A6899E867CB",
};
const ADDRESS_ZERO = "0x0000000000000000000000000000000000000000";

export default function Wallet() {
  const [account, setAccount] = useState(null);
  const [transferAmount, setTransferAmount] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [selectedAccount, setSelectedAccount] = useState("eth");
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState(null);
  const [transactionType, setTransactionType] = useState("");
  const [transactionInfo, setTransactionInfo] = useState("");
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [transactionAmount, setTransactionAmount] = useState<any>("");
  const [walletModal, setWalletModal] = useState(false);
  const [walletContract, setWalletContract] = useState(null);
  const [ethBalance, setEthBalance] = useState("0");
  const [usdtBalance, setUsdtBalance] = useState("0");
  const [usdtDecimals, setUsdtDecimals] = useState(6);
  const [bondBalance, setBondBalance] = useState("0");
  const [moneyMarketBalance, setMoneyMarketBalance] = useState("0");
  const [equityBalance, setEquityBalance] = useState("0");
  // const [totalInvested, setTotalInvested] = useState({
  //   moneyMarket: "0",
  //   equity: "0",
  //   bonds: "0",
  // });
  // const [investmentTransactions, setInvestmentTransactions] = useState([]);
  // const [tokenDecimals, setTokenDecimals] = useState(18);
  const [transactions, setTransactions] = useState([]);

  // Initialize MetaMask and contract
  useEffect(() => {
    const connectWallet = async () => {
      if (!window.ethereum) {
        toast.error("Please install MetaMask!");
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
        toast.error("MetaMask not detected!");
        return;
      }
      try {
        const ethersProvider = new ethers.BrowserProvider(provider);
        const accounts = await ethersProvider.send("eth_requestAccounts", []);
        const signer = await ethersProvider.getSigner();

        // Wallet contract
        const walletContract = new ethers.Contract(
          WALLET_ADDRESS,
          WALLET_ABI,
          signer
        );
        setWalletContract(walletContract);
        setProvider(ethersProvider);
        setAccount(accounts[0]);

        // USDT contract
        const usdtContract = new ethers.Contract(
          USDT_ADDRESS,
          ERC20_ABI,
          ethersProvider
        );
        const usdtDec = await usdtContract.decimals();
        setUsdtDecimals(usdtDec);

        // Token contracts
        const bondToken = new ethers.Contract(
          TOKEN_ADDRESSES.bond,
          ERC20_ABI,
          ethersProvider
        );
        const moneyMarketToken = new ethers.Contract(
          TOKEN_ADDRESSES.moneyMarket,
          ERC20_ABI,
          ethersProvider
        );
        const equityToken = new ethers.Contract(
          TOKEN_ADDRESSES.equity,
          ERC20_ABI,
          ethersProvider
        );
        const tokenDec = await bondToken.decimals(); // Assumes same decimals
     

        // Investment contract
        const investmentContract = new ethers.Contract(
          INVESTMENT_ADDRESS,
          INVESTMENT_ABI,
          ethersProvider
        );

        // Fetch wallet balances
        const ethBal = await walletContract.getEthBalance(accounts[0]);
        const usdtBal = await walletContract.getUsdtBalance(accounts[0]);
        setEthBalance(ethers.formatEther(ethBal));
        setUsdtBalance(ethers.formatUnits(usdtBal, usdtDec));

        // Fetch token balances
        const bondBal = await bondToken.balanceOf(accounts[0]);
        const mmBal = await moneyMarketToken.balanceOf(accounts[0]);
        const equityBal = await equityToken.balanceOf(accounts[0]);
        setBondBalance(ethers.formatUnits(bondBal, tokenDec));
        setMoneyMarketBalance(ethers.formatUnits(mmBal, tokenDec));
        setEquityBalance(ethers.formatUnits(equityBal, tokenDec));

        // Fetch wallet transactions
        const walletTxs = await walletContract.getTransactionHistory(
          accounts[0]
        );
        const formattedWalletTxs = walletTxs.map((tx) => ({
          type: tx.transactionType,
          token: tx.token === ADDRESS_ZERO ? "ETH" : "USDT",
          amount:
            tx.token === ADDRESS_ZERO
              ? ethers.formatEther(tx.amount)
              : ethers.formatUnits(tx.amount, usdtDec),
          from: tx.from,
          to: tx.to,
          timestamp: new Date(Number(tx.timestamp) * 1000).toLocaleString(),
        }));
        setTransactions(formattedWalletTxs);

        // Fetch investment transactions
        // const investTxs = await investmentContract.getTransactionHistory();
        // const userInvestTxs = investTxs.filter(
        //   (tx) => tx.user.toLowerCase() === accounts[0].toLowerCase()
        // );
        // const formattedInvestTxs = userInvestTxs.map((tx) => ({
        //   type: ["Money Market", "Equity", "Bonds"][tx.investmentType],
        //   token: ["MMS", "EQUITY", "BOND"][tx.investmentType],
        //   amount: ethers.formatUnits(tx.amount, tokenDec),
        //   timestamp: new Date(Number(tx.timestamp) * 1000).toLocaleString(),
        // }));
        // setInvestmentTransactions(formattedInvestTxs);

        // setLoading(false);

        // Listen for account changes
    //     provider.on("accountsChanged", async (accounts) => {
    //       setAccount(accounts[0] || "");
    //       if (accounts[0]) {
    //         try {
    //           const ethBal = await walletContract.getEthBalance(accounts[0]);
    //           const usdtBal = await walletContract.getUsdtBalance(accounts[0]);
    //           const bondBal = await bondToken.balanceOf(accounts[0]);
    //           const mmBal = await moneyMarketToken.balanceOf(accounts[0]);
    //           const equityBal = await equityToken.balanceOf(accounts[0]);
    //           const [mmInvested, equityInvested, bondInvested] =
    //             await investmentContract.getTotalInvested(accounts[0]);
    //           setEthBalance(ethers.formatEther(ethBal));
    //           setUsdtBalance(ethers.formatUnits(usdtBal, usdtDec));
    //           setBondBalance(ethers.formatUnits(bondBal, tokenDec));
    //           setMoneyMarketBalance(ethers.formatUnits(mmBal, tokenDec));
    //           setEquityBalance(ethers.formatUnits(equityBal, tokenDec));
    //           setTotalInvested({
    //             moneyMarket: ethers.formatEther(mmInvested),
    //             equity: ethers.formatEther(equityInvested),
    //             bonds: ethers.formatEther(bondInvested),
    //           });

    //           const walletTxs = await walletContract.getTransactionHistory(
    //             accounts[0]
    //           );
    //           setTransactions(
    //             walletTxs.map((tx) => ({
    //               type: tx.transactionType,
    //               token: tx.token === ADDRESS_ZERO ? "ETH" : "USDT",
    //               amount:
    //                 tx.token === ADDRESS_ZERO
    //                   ? ethers.formatEther(tx.amount)
    //                   : ethers.formatUnits(tx.amount, usdtDec),
    //               from: tx.from,
    //               to: tx.to,
    //               timestamp: new Date(
    //                 Number(tx.timestamp) * 1000
    //               ).toLocaleString(),
    //             }))
    //           );

    //           const investTxs =
    //             await investmentContract.getTransactionHistory();
    //           const userInvestTxs = investTxs.filter(
    //             (tx) => tx.user.toLowerCase() === accounts[0].toLowerCase()
    //           );
    //           setInvestmentTransactions(
    //             userInvestTxs.map((tx) => ({
    //               type: ["Money Market", "Equity", "Bonds"][tx.investmentType],
    //               token: ["MMS", "EQUITY", "BOND"][tx.investmentType],
    //               amount: ethers.formatUnits(tx.amount, tokenDec),
    //               timestamp: new Date(
    //                 Number(tx.timestamp) * 1000
    //               ).toLocaleString(),
    //             }))
    //           );
    //         } catch (err) {
    //           return toast.error("Account change error: " + err.message);
    //         }
    //       }
    //     });
    //   } catch (err) {
    //     setLoading(false);
    //     return toast.error("Failed to initialize: " + err.message);
    //   }
    }catch(err){
      setLoading(false);
      return toast.error("Failed to initialize: " + err.message);
    }}

    connectWallet();
  }, []);

  // Handle ETH deposit
  const handleDepositEth = async () => {
    if (
      !Number(transactionAmount) ||
      isNaN(Number(transactionAmount)) ||
      Number(transactionAmount) <= 0
    ) {
      toast.error("Enter a valid ETH amount");
      return;
    }
    if (!walletContract) {
      toast.error("Wallet contract not initialized");
      return;
    }
    setLoading(true);
    const pendingToast = toast.loading("Processing Deposit...");
    try {
      const tx = await walletContract.depositEth({
        value: ethers.parseEther(transactionAmount),
      });
      await tx.wait();
      setLoading(false);
      toast.dismiss(pendingToast);
      toast.success("ETH deposited successfully");
      const ethBal = await walletContract.getEthBalance(account);
      setEthBalance(ethers.formatEther(ethBal));
      const txs = await walletContract.getTransactionHistory(account);
      setTransactions(
        txs.map((tx) => ({
          type: tx.transactionType,
          token: tx.token === ADDRESS_ZERO ? "ETH" : "USDT",
          amount:
            tx.token === ADDRESS_ZERO
              ? ethers.formatEther(tx.amount)
              : ethers.formatUnits(tx.amount, usdtDecimals),
          from: tx.from,
          to: tx.to,
          timestamp: new Date(Number(tx.timestamp) * 1000).toLocaleString(),
        }))
      );
      setTransactionAmount("");
    } catch (err) {
      setLoading(false);
      toast.dismiss(pendingToast);
      return toast.error(
        <div className="max-w-sm text-xs font-medium poppins overflow-hidden break-words line-clamp-2">
          <p className="line-clamp-2">ETH deposit failed: {err.message}</p>
        </div>
      );
    }
  };

  // Handle ETH withdrawal
  const handleWithdrawEth = async () => {
    if (
      !Number(transactionAmount) ||
      isNaN(Number(transactionAmount)) ||
      Number(transactionAmount) <= 0
    ) {
      toast.error("Enter a valid ETH amount");
      return;
    }
    if (!walletContract) {
      toast.error("Wallet contract not initialized");
      return;
    }
    setLoading(true);
    const pendingToast = toast.loading("Processing Withdrawal...");
    try {
      const tx = await walletContract.withdrawEth(
        ethers.parseEther(transactionAmount)
      );
      await tx.wait();
      setLoading(false);
      toast.dismiss(pendingToast);
      toast.success("ETH withdrawn successfully");
      const ethBal = await walletContract.getEthBalance(account);
      setEthBalance(ethers.formatEther(ethBal));
      const txs = await walletContract.getTransactionHistory(account);
      setTransactions(
        txs.map((tx) => ({
          type: tx.transactionType,
          token: tx.token === ADDRESS_ZERO ? "ETH" : "USDT",
          amount:
            tx.token === ADDRESS_ZERO
              ? ethers.formatEther(tx.amount)
              : ethers.formatUnits(tx.amount, usdtDecimals),
          from: tx.from,
          to: tx.to,
          timestamp: new Date(Number(tx.timestamp) * 1000).toLocaleString(),
        }))
      );
      setTransactionAmount("");
    } catch (err) {
      setLoading(false);
      toast.dismiss(pendingToast);

      return toast.error(
        <div className="max-w-sm text-xs font-medium poppins overflow-hidden break-words line-clamp-2">
          <p className="line-clamp-2">ETH withdrawal failed: {err.message}</p>
        </div>
      );
    }
  };

  // Handle ETH transfer
  const handleTransferEth = async () => {
    if (
      !Number(transferAmount) ||
      isNaN(Number(transferAmount)) ||
      Number(transferAmount) <= 0
    ) {
      toast.error("Enter a valid ETH amount");
      return;
    }
    if (!ethers.isAddress(recipientAddress)) {
      toast.error("Enter a valid recipient address");
      return;
    }
    if (!walletContract) {
      toast.error("Wallet contract not initialized");
      return;
    }
    setLoading(true);
    const pendingToast = toast.loading(
      `Processing ${selectedAccount?.toUpperCase()}  Transfer...`
    );
    try {
      const tx = await walletContract.transferEth(
        recipientAddress,
        ethers.parseEther(transferAmount)
      );
      await tx.wait();
      toast.dismiss(pendingToast);
      setLoading(false);
      toast.success("ETH transferred successfully");
      const ethBal = await walletContract.getEthBalance(account);
      setEthBalance(ethers.formatEther(ethBal));
      const txs = await walletContract.getTransactionHistory(account);
      setTransactions(
        txs.map((tx) => ({
          type: tx.transactionType,
          token: tx.token === ADDRESS_ZERO ? "ETH" : "USDT",
          amount:
            tx.token === ADDRESS_ZERO
              ? ethers.formatEther(tx.amount)
              : ethers.formatUnits(tx.amount, usdtDecimals),
          from: tx.from,
          to: tx.to,
          timestamp: new Date(Number(tx.timestamp) * 1000).toLocaleString(),
        }))
      );
      setTransferAmount("");
      setRecipientAddress("");
    } catch (err) {
      setLoading(false);
      toast.dismiss(pendingToast);
      return toast.error(
        <div className="max-w-sm text-xs font-medium poppins overflow-hidden break-words line-clamp-2">
          <p className="line-clamp-2">ETH transfer failed:{err.message}</p>
        </div>
      );
    }
  };

  // Handle USDT deposit
  const handleDepositUsdt = async () => {
    if (
      !transactionAmount ||
      isNaN(Number(transactionAmount)) ||
      Number(transactionAmount) <= 0
    ) {
      toast.error("Enter a valid USDT amount");
      return;
    }
    if (!walletContract) {
      toast.error("Wallet contract not initialized");
      return;
    }
    setLoading(true);
    const pendingToast = toast.loading("Processing Deposit...");

    try {
      const usdtContract = new ethers.Contract(
        USDT_ADDRESS,
        ERC20_ABI,
        await provider.getSigner()
      );
      const amount = ethers.parseUnits(transactionAmount, usdtDecimals);
      const allowance = await usdtContract.allowance(account, WALLET_ADDRESS);
      if (allowance < amount) {
        const approveTx = await usdtContract.approve(WALLET_ADDRESS, amount);
        await approveTx.wait();
      }
      const tx = await walletContract.depositUsdt(amount);
      await tx.wait();
      setLoading(false);
      toast.dismiss(pendingToast);
      toast.success("USDT deposited successfully");
      const usdtBal = await walletContract.getUsdtBalance(account);
      setUsdtBalance(ethers.formatUnits(usdtBal, usdtDecimals));
      const txs = await walletContract.getTransactionHistory(account);
      setTransactions(
        txs.map((tx) => ({
          type: tx.transactionType,
          token: tx.token === ADDRESS_ZERO ? "ETH" : "USDT",
          amount:
            tx.token === ADDRESS_ZERO
              ? ethers.formatEther(tx.amount)
              : ethers.formatUnits(tx.amount, usdtDecimals),
          from: tx.from,
          to: tx.to,
          timestamp: new Date(Number(tx.timestamp) * 1000).toLocaleString(),
        }))
      );
      setTransactionAmount("");
    } catch (err) {
      setLoading(false);
      toast.dismiss(pendingToast);

      return toast.error(
        <div className="max-w-sm text-xs font-medium poppins overflow-hidden break-words line-clamp-2">
          <p className="line-clamp-2">USDT deposit failed:{err.message}</p>
        </div>
      );
    }
  };

  // Handle USDT withdrawal
  const handleWithdrawUsdt = async () => {
    if (
      !Number(transactionAmount) ||
      isNaN(Number(transactionAmount)) ||
      Number(transactionAmount) <= 0
    ) {
      toast.error("Enter a valid USDT amount");
      return;
    }
    if (!walletContract) {
      toast.error("Wallet contract not initialized");
      return;
    }
    setLoading(true);
    const pendingToast = toast.loading("Processing Withdrawal...");

    try {
      setLoading(false);

      const amount = ethers.parseUnits(transactionAmount, usdtDecimals);
      const tx = await walletContract.withdrawUsdt(amount);
      await tx.wait();
      setLoading(false);
      toast.dismiss(pendingToast);
      toast.success("USDT withdrawn successfully");
      const usdtBal = await walletContract.getUsdtBalance(account);
      setUsdtBalance(ethers.formatUnits(usdtBal, usdtDecimals));
      const txs = await walletContract.getTransactionHistory(account);
      setTransactions(
        txs.map((tx) => ({
          type: tx.transactionType,
          token: tx.token === ADDRESS_ZERO ? "ETH" : "USDT",
          amount:
            tx.token === ADDRESS_ZERO
              ? ethers.formatEther(tx.amount)
              : ethers.formatUnits(tx.amount, usdtDecimals),
          from: tx.from,
          to: tx.to,
          timestamp: new Date(Number(tx.timestamp) * 1000).toLocaleString(),
        }))
      );
      setTransactionAmount("");
    } catch (err) {
      setLoading(false);
      toast.dismiss(pendingToast);

      return toast.error(
        <div className="max-w-sm text-xs font-medium poppins overflow-hidden break-words line-clamp-2">
          <p className="line-clamp-2">USDT withdrawal failed:{err.message}</p>
        </div>
      );
    }
  };

  // Handle USDT transfer
  const handleTransferUsdt = async () => {
    if (
      !Number(transferAmount) ||
      isNaN(Number(transferAmount)) ||
      Number(transferAmount) <= 0
    ) {
      toast.error("Enter a valid USDT amount");
      return;
    }
    if (!ethers.isAddress(recipientAddress)) {
      toast.error("Enter a valid recipient address");
      return;
    }
    if (!walletContract) {
      toast.error("Wallet contract not initialized");
      return;
    }
    setLoading(true);
    const pendingToast = toast.loading(
      `Processing ${selectedAccount?.toUpperCase()}  Transfer...`
    );

    try {
      const amount = ethers.parseUnits(transferAmount, usdtDecimals);
      const tx = await walletContract.transferUsdt(recipientAddress, amount);
      await tx.wait();
      toast.dismiss(pendingToast);
      setLoading(false);
      toast.success("USDT transferred successfully");
      const usdtBal = await walletContract.getUsdtBalance(account);
      setUsdtBalance(ethers.formatUnits(usdtBal, usdtDecimals));
      const txs = await walletContract.getTransactionHistory(account);
      setTransactions(
        txs.map((tx) => ({
          type: tx.transactionType,
          token: tx.token === ADDRESS_ZERO ? "ETH" : "USDT",
          amount:
            tx.token === ADDRESS_ZERO
              ? ethers.formatEther(tx.amount)
              : ethers.formatUnits(tx.amount, usdtDecimals),
          from: tx.from,
          to: tx.to,
          timestamp: new Date(Number(tx.timestamp) * 1000).toLocaleString(),
        }))
      );
      setTransferAmount("");
      setRecipientAddress("");
    } catch (err) {
      return toast.error(
        <div className="max-w-sm text-xs font-medium poppins overflow-hidden break-words line-clamp-2">
          <p className="line-clamp-2">USDT transfer failed:{err.message}</p>
        </div>
      );
    }
  };

  const handleTransaction = () => {
    if (transactionType === "withdraw" && transactionInfo === "ETH") {
      handleWithdrawEth();
    } else if (transactionType === "deposit" && transactionInfo === "ETH") {
      handleDepositEth();
    } else if (transactionType === "deposit" && transactionInfo === "USDT") {
      handleDepositUsdt();
    } else {
      handleWithdrawUsdt();
    }
  };

  if (!account) {
    return <div className="py-7 px-4">Loading...</div>;
  }

  return (
    <>
      <div className="py-7 w-full px-4">
        <div className="flex flex-col gap-1.5 poppins mb-10">
          <h1 className="text-xl font-medium">Wallet</h1>
          <span className="text-xs font-medium text-[#9F9F9F]">
            Deposit, withdraw, and transfer your crypto assets with ease.
          </span>
        </div>

        <section className="w-full mb-12 flex-col lg:flex-row flex gap-6">
          <div className="w-full xlw-[55%]">
            {/* ETHEREUM */}
            <section className="mb-4 gap-6 flex flex-col lg:flex-row">
              {/* Card 1 - ETH Balance */}
              <div
                style={{
                  background:
                    "linear-gradient(180deg, rgba(250, 250, 250, 0.80) 8.87%, rgba(252, 252, 252, 0.89) 17.57%, #FFF 27.81%)",
                  boxShadow: "1px 1px 2px 0px rgba(0, 0, 0, 0.04)",
                }}
                className="p-4 w-full lg:w-fit flex flex-col gap-6 rounded-[8px] poppins min-w-xs border border-[#EAEAEA]"
              >
                <h2 className="text-lg font-medium">ETH Balance</h2>
                <section className="flex flex-col gap-4">
                  <span>
                    <Image src={ETH} alt="eth" />
                  </span>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-[#737373]">
                      Total Balance
                    </span>
                    <span className="text-xl font-medium flex items-center gap-1">
                      <HTMLContent
                        targetValue={Number(ethBalance)}
                        maxDecimals={5}
                        duration={1.5}
                      />
                      ETH
                    </span>
                  </div>
                </section>
                <section className="flex flex-col items-center lg:flex-row justify-between gap-2">
                  <motion.button
                    onClick={() => {
                      setWalletModal(true);
                      setTransactionInfo("ETH");
                      setTransactionType("withdraw");
                    }}
                    whileTap={{ scale: 0.94 }}
                    className="py-2 px-5 w-[45%] flex items-center gap-2 justify-center duration-500 hover:bg-[#1e3d24] hover:text-white font-medium text-sm poppins text-[#1e3d34] cursor-pointer rounded-[8px] border border-[#1E3D34]"
                  >
                    Withdraw
                    <Image
                      src={SEND}
                      alt="send"
                      className="hover:fill-white hover:stroke-white duration-200 ease-in text-white"
                    />
                  </motion.button>
                  <motion.button
                    onClick={() => {
                      setWalletModal(true);
                      setTransactionInfo("ETH");
                      setTransactionType("deposit");
                    }}
                    whileTap={{ scale: 0.94 }}
                    className="py-2 px-5 w-[45%] flex justify-center items-center gap-2 duration-500 hover:bg-[#1e3d24] hover:text-white font-medium text-sm poppins text-[#1e3d34] cursor-pointer rounded-[8px] border border-[#1E3D34]"
                  >
                    Deposit
                    <Image
                      src={RECEIVE}
                      alt="receive"
                      className="hover:fill-white hover:stroke-white duration-200 ease-in text-white"
                    />
                  </motion.button>
                </section>
              </div>

              {/* Card 2 - Token Balances */}
              <div
                style={{
                  background:
                    "linear-gradient(180deg, rgba(250, 250, 250, 0.80) 8.87%, rgba(252, 252, 252, 0.89) 17.57%, #FFF 27.81%)",
                  boxShadow: "1px 1px 2px 0px rgba(0, 0, 0, 0.04)",
                }}
                className="p-4 w-full lg:w-fit flex flex-col gap-6 rounded-[8px] poppins min-w-xs border border-[#EAEAEA]"
              >
                <section className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <h2 className="text-lg font-medium">Token Balances</h2>
                    <p className="text-sm">Bonds: {bondBalance} BOND</p>
                    <p className="text-sm">Money Market: {moneyMarketBalance} MMS</p>
                    <p className="text-sm">Equity: {equityBalance} EQUITY</p>
                  </div>
                </section>
                <section className="flex justify-center">
                  <Link href="/dashboard/redeem">
                    <motion.button
                      whileTap={{ scale: 0.94 }}
                      className="py-2 px-5 w-full duration-500 bg-[#1e3d24] text-white font-medium text-sm poppins cursor-pointer rounded-[8px] hover:bg-[#2a4d34]"
                    >
                      Redeem Tokens
                    </motion.button>
                  </Link>
                </section>
              </div>

              {/* Card 3 - USDT Balance */}
              <div
                style={{
                  background:
                    "linear-gradient(180deg, rgba(250, 250, 250, 0.80) 8.87%, rgba(252, 252, 252, 0.89) 17.57%, #FFF 27.81%)",
                  boxShadow: "1px 1px 2px 0px rgba(0, 0, 0, 0.04)",
                }}
                className="p-4 w-full lg:w-fit flex flex-col gap-6 rounded-[8px] poppins min-w-xs border border-[#EAEAEA]"
              >
                <h2 className="text-lg font-medium">USDT Balance</h2>
                <section className="flex flex-col gap-4">
                  <span>
                    <Image src={USDC} alt="usdc" />
                  </span>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-[#737373]">
                      Total Balance
                    </span>
                    <span className="text-xl font-medium flex items-center gap-1">
                      <HTMLContent
                        targetValue={Number(usdtBalance)}
                        maxDecimals={5}
                        duration={1.5}
                      />
                      USDT
                    </span>
                  </div>
                </section>
                <section className="flex flex-col items-center lg:flex-row justify-between gap-2">
                  <motion.button
                    onClick={() => {
                      setWalletModal(true);
                      setTransactionInfo("USDT");
                      setTransactionType("withdraw");
                    }}
                    whileTap={{ scale: 0.94 }}
                    className="py-2 px-5 w-[45%] flex justify-center items-center gap-2 duration-500 hover:bg-[#1e3d24] hover:text-white font-medium text-sm poppins text-[#1e3d34] cursor-pointer rounded-[8px] border border-[#1E3D34]"
                  >
                    Withdraw
                    <Image
                      src={SEND}
                      alt="send"
                      className="hover:fill-white hover:stroke-white duration-200 ease-in text-white"
                    />
                  </motion.button>
                  <motion.button
                    onClick={() => {
                      setWalletModal(true);
                      setTransactionInfo("USDT");
                      setTransactionType("deposit");
                    }}
                    whileTap={{ scale: 0.94 }}
                    className="py-2 px-5 w-[45%] flex justify-center items-center gap-2 duration-500 hover:bg-[#1e3d24] hover:text-white font-medium text-sm poppins text-[#1e3d34] cursor-pointer rounded-[8px] border border-[#1E3D34]"
                  >
                    Deposit
                    <Image src={RECEIVE} alt="receive" />
                  </motion.button>
                </section>
              </div>
            </section>
          </div>

          <div
            style={{
              border: "0.5px solid #EAEAEA",
              boxShadow: "1px 1px 2px 0px rgba(56, 56, 56, 0.04)",
            }}
            className="w-full rounded-[10px] pb-12 flex flex-col gap-4 mb-3.5"
          >
            <header
              style={{ borderBottom: "0.5px solid #EAEAEA" }}
              className="p-4 poppins flex flex-col gap-1"
            >
              <span className="text-sm font-medium">Transfer Funds </span>

              <span className="text-xs font-medium text-[#9F9F9F]">
                Send funds securely and instantly
              </span>
            </header>

            <div className="poppins px-4 flex flex-col gap-6">
              {/* Section One */}
              <section className="flex flex-col gap-2">
                <span className="text-sm">Token to transfer </span>

                <select
                  value={selectedAccount}
                  onChange={(e) => setSelectedAccount(e.target.value)}
                  className="px-4 py-3 rounded-[4px] bg-[#F5F5F5] outline-none"
                >
                  <option value="eth" className="px-2.5 text-sm">
                    ETH - Bal: {Number(ethBalance)?.toLocaleString()} ETH
                  </option>
                  <option value="usdt" className="px-2.5">
                    USDT - Bal: {Number(usdtBalance)?.toLocaleString()} USDT
                  </option>
                </select>
              </section>

              {/* Section Two */}
              <section className="flex flex-col gap-2">
                <span className="text-sm">Recipient Address</span>

                <input
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  type="text"
                  placeholder="Recipient Address"
                  className="px-4 py-3 rounded-[4px] bg-[#F5F5F5] outline-none placeholder:text-sm"
                />
              </section>

              {/* Section Three */}
              <section className="flex flex-col gap-2">
                <span className="text-sm">Amount</span>

                <input
                  value={transferAmount}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d*\.?\d*$/.test(value)) {
                      setTransferAmount(value);
                    } else {
                      return toast.error("Kindly provide in a valid amount!");
                    }
                  }}
                  type="number"
                  placeholder="Enter Amount"
                  className="px-4 py-3 decoration-0 rounded-[4px] bg-[#F5F5F5] outline-none placeholder:text-sm"
                />
              </section>

              <motion.button
                onClick={() =>
                  selectedAccount === "eth"
                    ? handleTransferEth()
                    : handleTransferUsdt()
                }
                disabled={loading}
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.03 }}
                className="w-full poppins text-white flex min-h-10 items-center gap-2 justify-center text-sm font-medium bg-[#1E3D34] rounded-[8px] py-2.5 px-5 cursor-pointer ease-out duration-200"
              >
                {loading ? (
                  <DotLoader />
                ) : (
                  <>
                    <span className="capitalize">Transfer</span>
                    <Image src={ArrowRight} alt="arrowRight" />
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </section>

        {/* Transaction History */}

        <section
          style={{
            background:
              "linear-gradient(180deg, rgba(250, 250, 250, 0.80) 8.87%, rgba(252, 252, 252, 0.89) 17.57%, #FFF 27.81%)",
            boxShadow: "1px 1px 2px 0px rgba(0, 0, 0, 0.04)",
            border: "0.5px solid #EAEAEA",
          }}
          className="w-full flex flex-col gap-4 rounded-[10px] pb-8 mb-4"
        >
          <header className="p-4 poppins flex gap-1 flex-col border-b-[0.5px] border-[#EAEAEA]">
            <h1 className="text-sm font-medium">Wallet Transaction History </h1>
            <span className="text-xs font-medium text-[#9F9F9F]">
              View your recent deposits, withdrawals, and transfers.
            </span>
          </header>

          <div className="px-4 w-full max-h-[60vh] overflow-y-auto">
            {transactions?.length === 0 ? (
              <div className="animate-pulse w-full py-2.5 flex justify-center">
                No wallet transactions yet
              </div>
            ) : (
              <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead>
                  <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-700">
                    <th className="p-2 text-xs font-semibold border-b bg-[#F5F5F5] border border-[#eaeaea]">
                      Transaction Type
                    </th>
                    <th className="p-2 text-xs font-semibold border-b bg-[#F5F5F5] border border-[#eaeaea]">
                      Token
                    </th>
                    <th className="p-2 text-xs font-semibold border-b bg-[#F5F5F5] border border-[#eaeaea]">
                      Amount
                    </th>
                    <th className="p-2 text-xs font-semibold border-b bg-[#F5F5F5] border border-[#eaeaea]">
                      From (Wallet Address)
                    </th>
                    <th className="p-2 text-xs font-semibold border-b bg-[#F5F5F5] border border-[#eaeaea]">
                      To (Wallet Address)
                    </th>
                    <th className="p-2 text-xs font-semibold border-b bg-[#F5F5F5] border border-[#eaeaea]">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {transactions?.map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50 text-sm">
                      <td className="p-2 border border-[#eaeaea] text-[13px]">
                        {row?.type}
                      </td>
                      <td className="p-2 border border-[#eaeaea] text-[13px]">
                        {row?.token}
                      </td>
                      <td className="p-2 border border-[#eaeaea] text-[13px]">
                        {row.amount?.toLocaleString()}
                      </td>
                      <td className="p-2 border border-[#eaeaea] text-[13px]">
                        {row?.from?.slice(0, 6)}...{row?.from?.slice(-4)}
                      </td>
                      <td className="p-2 border border-[#eaeaea] text-[13px]">
                        {row?.to?.slice(0, 6)}...{row?.to?.slice(-4)}
                      </td>
                      <td className="p-2 border border-[#eaeaea] text-[13px]">
                        {row?.timestamp}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>

      {walletModal && (
        <WalletModal
          onClose={() => {
            setTransactionAmount("");
            setWalletModal(false);
          }}
        >
          <div className="poppins flex flex-col gap-6 justify-center">
            <header className="font-medium">
              <span className="capitalize">{transactionType}</span>{" "}
              <span className="uppercase">{transactionInfo}</span>
            </header>
            <main className="flex text-sm justify-between items-center rounded bg-[#f5f5f5] pr-4">
              <input
                className="h-full py-3 px-4 outline-none"
                value={transactionAmount}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d*\.?\d*$/.test(value)) {
                    setTransactionAmount(value);
                  } else {
                    return toast.error("Kindly provide in a valid amount!");
                  }
                }}
                placeholder="Enter Amount"
                type="text"
              />

              <span className="flex gap-2 items-center">
                <p className="text-xs text-[#737373]">Bal</p>
                <span className="text-xs font-semibold">
                  {transactionInfo?.toLocaleLowerCase() === "eth"
                    ? ethBalance
                    : usdtBalance}{" "}
                  <span className="uppercase">{transactionInfo}</span>
                </span>
              </span>
            </main>
            <footer className="w-full">
              <motion.button
                onClick={handleTransaction}
                disabled={loading}
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.03 }}
                className="w-full poppins text-white flex items-center min-h-10 gap-2 justify-center text-sm font-medium bg-[#1E3D34] rounded-[8px] py-2.5 px-5 cursor-pointer ease-out duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <DotLoader />
                ) : (
                  <>
                    <span className="capitalize">{transactionType}</span>
                    <Image src={ArrowRight} alt="arrowRight" />
                  </>
                )}
              </motion.button>
            </footer>
          </div>
        </WalletModal>
      )}
    </>
  );
}
