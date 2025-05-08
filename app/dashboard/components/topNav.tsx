"use client";
import React, { useState, useEffect, useRef } from "react";
import Wallet from "@/assets/wallet.svg";
import { BsSearch, BsBell, BsChevronDown } from "react-icons/bs";
import { ethers } from "ethers";
import Avatar from "@/app/components/Avatar";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";

const WALLET_ADDRESS = "0x003a2A222f6E6da5A5AAbF742591CF86De5642c6";
const WALLET_ABI = [
  "function getEthBalance(address _user) external view returns (uint256)",
];

const TopNav = ({ toggleSidebar }) => {
  const [username, setUsername] = useState(null);
  const [account, setAccount] = useState("");
  const [ethBalance, setEthBalance] = useState("0");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Client-side only logic
  useEffect(() => {
    // Check if we're in the browser environment
    if (typeof window !== "undefined") {
      // Read username from sessionStorage if it exists
      const storedUsername = sessionStorage.getItem("username");
      if (storedUsername) {
        setUsername(storedUsername);
      }

      const init = async () => {
        if (!window.ethereum) return;

        let provider;
        if (window.ethereum.providers) {
          provider =
            window.ethereum.providers.find((p) => p.isMetaMask) ||
            window.ethereum;
        } else if (window.ethereum.isMetaMask) {
          provider = window.ethereum;
        } else {
          return;
        }

        const ethersProvider = new ethers.BrowserProvider(provider);
        const accounts = await ethersProvider.send("eth_requestAccounts", []);

        const walletContract = new ethers.Contract(
          WALLET_ADDRESS,
          WALLET_ABI,
          ethersProvider
        );

        console.log(accounts);

        setAccount(accounts[0]);
        const ethBal = await walletContract.getEthBalance(accounts[0]);
        setEthBalance(ethers.formatEther(ethBal));

        provider.on("accountsChanged", async (accounts) => {
          setAccount(accounts[0] || "");
          if (accounts[0]) {
            const ethBal = await walletContract.getEthBalance(accounts[0]);
            setEthBalance(ethers.formatEther(ethBal));
          }
        });
      };
      init();
    }
  }, []);

  return (
    <div className="flex justify-between items-center w-full p-4 border-b-[1px] border-gray-200">
      {/* Hamburger Menu for small screens */}
      <div className="md:hidden flex items-center mr-3">
        <button onClick={toggleSidebar} className="p-2 focus:outline-none">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      {/* Search Box */}
      <div className="bg-gray-100 flex items-center p-3 rounded-lg gap-2 w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
        <BsSearch />
        <input
          type="text"
          className="focus:outline-0 placeholder:text-xs placeholder:font-semibold w-full"
          placeholder="Find Investments"
        />
      </div>

      {/* Notifications & Wallet Info */}
      <div className="flex items-center gap-3 ml-4">
        {/* Bell Icon */}
        <div className="border rounded-full p-2">
          <BsBell className="text-lg" />
        </div>

        {/* User Wallet Info */}
        <div className="flex items-center gap-3">
          <p className="text-xs font-medium hidden sm:block">
            {account ? `${ethBalance} ETH` : "Connect Wallet"}
          </p>

          <span>
            <Image src={Wallet} alt="hey" />
          </span>
          <div className="relative flex items-center gap-1">
            <div ref={dropdownRef} className="relative">
              <div
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                className="flex poppins cursor-pointer items-center gap-1"
              >
                <div className="mr-1.5">
                  <Avatar name={username} />
                </div>
                <div className="flex flex-col gap-[1.5px]">
                  <span className="text-xs font-medium capitalize ">
                    {username ?? (
                      <span className="animate-pulse">Fetching User</span>
                    )}
                  </span>
                </div>

                <span>
                  <BsChevronDown className="text-sm" />
                </span>
              </div>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 min-w-40 max-w-56 flex justify-center px-2 bg-white shadow-lg rounded-md overflow-hidden border border-gray-200"
                  >
                    <ul className="py-2 text-xs font-medium">
                      <li>
                        <Link
                          href=""
                          className="block px-4 py-2 text-gray-700 font-semibold hover:bg-gray-100"
                        >
                          {account ? (
                            `${account.slice(0, 8)}...${account.slice(-4)}`
                          ) : (
                            <span className="animate-pulse">Fetching...</span>
                          )}
                        </Link>
                      </li>
                      <li>
                        <Link
                          href=""
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                        >
                          Settings
                        </Link>
                      </li>
                      <li>
                        <button
                          onClick={() => {
                            sessionStorage.removeItem("avatarColor");
                            // logout();
                          }}
                          className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                        >
                          Logout
                        </button>
                      </li>
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopNav;
