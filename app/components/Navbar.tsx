import { useState } from "react";
import Logo from "./Logo";
import Link from "next/link";

const Navbar = ({
  connectWallet,
  account,
  isLoading,
  activeTab,
  setActiveTab,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <>
      {/* Navbar for larger screens */}
      <div className="flex justify-between items-center px-7 py-3 my-5 text-xs rounded-md shadow-lg shadow-black/6  mx-6 md:mx-8 lg:mx-20">
        <Logo />

        <div className="gap-5 [&>*]:rounded-md [&>*]:hover:bg-[rgba(0,0,0,0.1)] font-medium [&>*]:p-3 cursor-pointer [&>*]:transition hidden md:flex">
          <Link
            className={`${
              activeTab === "home"
                ? "py-2 px-2.5 text-[#1E3D34] bg-[#f5f5f5]"
                : ""
            } duration-500 ease-in-out`}
            onClick={() => setActiveTab("home")}
            href="#top"
          >
            Home
          </Link>
          <Link
            className={`${
              activeTab === "contact"
                ? "py-2 px-2.5 text-[#1E3D34] bg-[#f5f5f5]"
                : ""
            } duration-500 ease-in-out`}
            onClick={() => setActiveTab("contact")}
            href="#contact"
          >
            Contact Us
          </Link>
          <Link
            className={`${
              activeTab === "about"
                ? "py-2 px-2.5 text-[#1E3D34] bg-[#f5f5f5]"
                : ""
            } duration-500 ease-in-out`}
            onClick={() => setActiveTab("about")}
            href="#about"
          >
            About Us
          </Link>
        </div>
        <div className="[&>*]:rounded-md [&>*]:p-2 gap-2 [&>*]:cursor-pointer hidden md:inline-block">
          {!account ? (
            <button
              onClick={() => connectWallet()}
              disabled={isLoading} // Disable when loading
              className="bg-[#1e3d34] py-2.5 px-5 text-white font-medium"
            >
              {isLoading ? "Connecting..." : "Login with MetaMask"}
            </button>
          ) : (
            <div className="bg-[#1e3d34] text-white font-medium p-2 rounded-md">
              Welcome, {account.slice(0, 6)}!
            </div>
          )}
        </div>
        {/* Mobile Hamburger Menu */}
        <button
          onClick={toggleSidebar}
          className="text-xl font-semibold p-2 rounded-md md:hidden"
        >
          &#9776;
        </button>
      </div>

      {/* Sidebar for small screens */}
      <div
        className={`fixed inset-0 z-50 bg-black/50 md:hidden ${
          isSidebarOpen ? "block" : "hidden"
        }`}
        onClick={toggleSidebar}
      ></div>

      <div
        className={`fixed top-0 left-0 h-full w-64 z-[66] bg-white shadow-xl transition-transform duration-300 ease-in-out transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:hidden`}
      >
        <div className="flex justify-between items-center p-5">
          <Logo />
          <button
            onClick={toggleSidebar}
            className="text-xl font-semibold p-2 rounded-md"
          >
            &#10005; {/* Close button */}
          </button>
        </div>
        <div className="flex flex-col gap-5 p-5">
          <div>Home</div>
          <div>Contact Us</div>
          <div>About Us</div>
        </div>
        <div className="p-5">
          {!account ? (
            <button
              onClick={() => connectWallet()}
              disabled={isLoading} // Disable when loading
              className="bg-[#1e3d34] text-white font-medium w-full p-2 rounded-md"
            >
              {isLoading ? "Connecting..." : "Login with MetaMask"}
            </button>
          ) : (
            <div className="bg-[#1e3d34] text-white font-medium p-2 rounded-md">
              Welcome, {account.slice(0, 6)}!
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;
