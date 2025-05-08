
import React, { useState } from "react";
import { IoClose } from "react-icons/io5";
import { BeatLoader } from "react-spinners"; // Add this for the loading spinner

const MetaModal = ({ onClose, username, setUsername, connectWallet }:{onClose:()=>void,username:string,setUsername:(value:string)=>void,connectWallet:()=>void}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleConnectWallet = async () => {
    setIsLoading(true);
    try {
      await connectWallet();
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed w-[100vw] h-[100vh] bg-[rgba(0,0,0,.5)] top-0 flex justify-center items-center montserrat transition-all duration-300">
      <div className="relative bg-white rounded-md p-10 flex flex-col gap-5 items-center animate__animated animate__fadeIn">
        <div
          className="absolute top-2 right-2 w-[15px] h-[15px] transition hover:text-red-600 text-lg hover:text-xl cursor-pointer"
          onClick={onClose} // Close via callback
        >
          <IoClose />
        </div>
        <div className="text-xl pb-5">Log In or Sign Up</div>
        <div className="flex flex-col gap-2">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
            className="p-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-[#1e3d34] transition"
          />
          <button
            onClick={handleConnectWallet}
            disabled={isLoading}
            className="bg-[#1e3d34] text-white font-medium p-2 rounded-md transition duration-300 hover:bg-[#184b42] disabled:bg-gray-500"
          >
            {isLoading ? <BeatLoader size={8} color="#fff" /> : "Register"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MetaModal;
