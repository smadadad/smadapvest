"use client";
import toast from "react-hot-toast";
import PREVIEW from "@/assets/preview.svg";
import { ethers } from "ethers";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MetaModal from "./components/MetaModal";
import Navbar from "./components/Navbar";
import Image from "next/image";
import { motion } from "motion/react";
import FadeInSection from "./components/FadeInSection";
import JourneySection from "./components/JourneyPage";
import AboutUs from "./components/AboutUs";
import LogoWhite from "@/assets/logo-white.svg";
import MESSAGE_ICON from "@/assets/message-white.svg";
import Link from "next/link";

// Prevent multiple wallet requests
let requestInProgress = false;

export default function Home() {
  const [activeTab, setActiveTab] = useState<string | null>("home");
  const [account, setAccount] = useState<string | null>(null);
  // const [clicked, setClicked] = useState("");
  // const [provider, setProvider] = useState<any>(null);
  // const [isRegistered, setIsRegistered] = useState(false);
  const [username, setUsername] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // For loading state
  const router = useRouter();

  const USER_REGISTRY_ADDRESS = "0x30473df72d8D0E2B7c320Be68922B46b58dc931b";
  const USER_REGISTRY_ABI = [
    "function register(string memory _username) external",
    "function isUserRegistered(address _user) external view returns (bool)",
    "function users(address) external view returns (address userAddress, string username, uint256 signupDate, bool isRegistered)",
  ];

  const connectWallet = async () => {
    if (requestInProgress) {
      console.log("Wallet connection already pending...");
      return;
    }

    requestInProgress = true;
    setIsLoading(true); // Set loading state

    try {
      if (!window.ethereum) {
        toast.error("Please install MetaMask!");
        setAccount(null); // Ensure account is reset if no MetaMask
        return;
      }

      let injectedProvider;
      if (window.ethereum.providers) {
        injectedProvider =
          window.ethereum.providers.find((p) => p.isMetaMask) ||
          window.ethereum;
      } else if (window.ethereum.isMetaMask) {
        injectedProvider = window.ethereum;
      } else {
        toast.error(
          "MetaMask not detected! Please ensure MetaMask is installed and active."
        );
        setAccount(null); // Ensure account is reset if MetaMask is not detected
        return;
      }

      const ethersProvider = new ethers.BrowserProvider(injectedProvider);
      const accounts = await ethersProvider.send("eth_requestAccounts", []);
      if (!accounts.length) {
        toast.error("No accounts found.");
        setAccount(null); // Reset account if no accounts found
        return;
      }

      setAccount(accounts[0]); // Set the account if login is successful
      // setProvider(ethersProvider);

      const signer = await ethersProvider.getSigner();
      const userRegistry = new ethers.Contract(
        USER_REGISTRY_ADDRESS,
        USER_REGISTRY_ABI,
        signer
      );

      const registered = await userRegistry.isUserRegistered(accounts[0]);
      // setIsRegistered(registered);

      if (!registered && !username) {
        setShowModal(true);
      } else if (!registered && username) {
        const tx = await userRegistry.register(username);
        sessionStorage.setItem("username", username);
        await tx.wait();
        // setIsRegistered(true);
        setUsername("");
        setShowModal(false);
        toast.success("Registration successful! Redirecting to dashboard...");
        router.push("/dashboard");
      } else if (registered) {
        sessionStorage.setItem("username", username);
        setShowModal(false);
        toast.success("User already registered. Redirecting to dashboard...");
        router.push("/dashboard");
      } else {
        toast.error("User not registered. Awaiting input...");
      }
    } 
     //eslint-disable-next-line @typescript-eslint/no-explicit-any 
    catch (err: any) {
      if (
        err.message &&
        err.message.includes("ethers-user-denied: User rejected the request.")
      ) {
        toast.error(
          "Connection request rejected. Please approve the connection in MetaMask."
        );
        setAccount(null); // Reset account when connection is rejected
      } else if (err.code === -32002) {
        toast.error(
          "Wallet connection already pending. Please approve in MetaMask."
        );
      } else {
        console.error("Wallet connection error:", err);
        toast.error("Connection failed. Please try again.");
        setAccount(null); // Reset account on any other error
      }
    } finally {
      requestInProgress = false;
      setIsLoading(false); // Reset loading state
    }
  };

  useEffect(() => {
    const loadAccount = async () => {
      if (window.ethereum) {
        const ethersProvider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await ethersProvider.listAccounts();
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setProvider(ethersProvider);

          const userRegistry = new ethers.Contract(
            USER_REGISTRY_ADDRESS,
            USER_REGISTRY_ABI,
            ethersProvider
          );

          const registered = await userRegistry.isUserRegistered(accounts[0]);
          setIsRegistered(registered);
          if (registered) {
            toast.success(
              "User already registered. Redirecting to dashboard..."
            );
            router.push("/dashboard");
          }
        }
      }
    };

    loadAccount().catch((error) => {
      console.error("useEffect error:", error);
      toast.error("Failed to load account.");
    });
  }, [router]);

  return (
    <div className="flex flex-col w-full scroll-smooth items-center justify-center ">
      {" "}
      <>
        {showModal && (
          <MetaModal
            onClose={() => setShowModal(false)}
            username={username}
            setUsername={setUsername}
            connectWallet={connectWallet}
          />
        )}
        <div
          className="min-h-screen w-full bgcover bg-center bg-no-repeat montserrat"
          style={{
            backgroundImage: `url('/grid-blocks.svg')`,
          }}
        >
          <Navbar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            account={account}
            isLoading={isLoading}
            connectWallet={connectWallet}
          />

          <div className="text-center flex justify-center items-center p-10 pb-0 flex-col mx-6 md:mx-8 lg:mx-20">
            <div className="leading-relaxed font-normal text-5xl">
              Invest In Real Assets, <br /> Your Way.
            </div>
            <div className="text-gray-500 mb-5">
              A modern platform for investing in Money, Markets, Bonds, and
              Tokenized Equity <br /> using your card or crypto wallet
            </div>
            <div className="[&>*]:rounded-md [&>*]:p-2 gap-2 [&>*]:cursor-pointer flex text-xs mb-7">
              {!account ? (
                <motion.button
                  whileTap={{ scale: 0.93 }}
                  onClick={() => connectWallet()}
                  disabled={isLoading} // Disable when loading
                  className="bg-[#1e3d34] py-2.5 px-5  text-white font-medium"
                >
                  {isLoading ? "Connecting..." : "Login with MetaMask"}
                </motion.button>
              ) : (
                <div className="bg-[#1e3d34] text-white font-medium p-2 rounded-md">
                  Welcome, {account.slice(0, 6)}!
                </div>
              )}
            </div>
          </div>

          {/* Scroll in anumation here */}

          <FadeInSection>
            <div className="w-full flex mt-4 justify-center">
              <Image
                src={PREVIEW}
                alt="preview"
                className="hover:scale-105 duration-500 ease-in-out cursor-pointer w-[80%] 2xl:w-auto"
              />
            </div>
          </FadeInSection>
        </div>
        <JourneySection />

        <FadeInSection>
          <AboutUs />
        </FadeInSection>

        <footer className="bg-[#1E3D34] flex flex-col gap-12 items-center py-16 w-full px-6 md:px-8 lg:px-20">
          <section className="flex w-full justify-center pb-12 border-b-[0.5px] border-[#585858]">
            <div className="flex items-center">
              <Image src={LogoWhite} alt="logo" />

              <span className="montserrat text-white text-2xl font-bold">
                SMADAPVEST
              </span>
            </div>
          </section>

          <section className="w-3/5 poppins text-white flex flex-col items-center gap-2 md:flex-row font-medium text-sm md:text-base justify-between">
            <div className="flex gap-2">
              <Link onClick={() => setActiveTab("home")} href="#top">
                Home
              </Link>
              <Link onClick={() => setActiveTab("contact")} href="#contact">
                Contact Us
              </Link>
              <Link onClick={() => setActiveTab("about")} href="#about">
                About Us
              </Link>
            </div>

            <div
              id="contact"
              className="flex flex-col md:flex-row gap-4 items-center"
            >
              <span className="hidden md:inline">Contact Us</span>

              <span className="flex gap-2 items-center">
                <Image
                  className="stroke-white"
                  src={MESSAGE_ICON}
                  alt="message"
                />
                <span>Email : adamsinvestment.com</span>
              </span>
            </div>
          </section>
        </footer>
      </>
    </div>
  );
}
