// components/MagicCard.jsx
"use client";
import React from "react";
import { FaArrowUp, FaArrowRight } from "react-icons/fa";
import { motion } from "motion/react";

const MagicCard = ({ setModalOpen, setInvestmentData }) => {
  const investmentData = {
    name: "Money Market",
    minimum: 1,
    returns: "+5.2%",
    maturity: "10 years",
    risk: "Low Risk",
  };

  const handleInvest = () => {
    setInvestmentData(investmentData);
    setModalOpen(true);
  };

  // const handleInvest = () => {
  //   // Pass investment data via URL query params
  //   router.push(
  //     `/payment?name=${encodeURIComponent(investmentData.name)}&minimum=${
  //       investmentData.minimum
  //     }&returns=${investmentData.returns}&maturity=${investmentData.maturity}`
  //   );
  // };

  return (
    <div className="border-[1px] border-gray-200 p-4 rounded-xl min-w-[350px] mb-5">
      <div className="bg-amber-100 w-10 h-10 rounded-full mb-3"></div>
      <div className="mb-3 font-semibold flex justify-between">
        Money Market
        <span className="p-1 text-green-500 text-xs bg-green-100 rounded-xl flex items-center mx-1">
          Low Risk
        </span>
      </div>
      <div className="justify-between text-xs text-gray-400 flex items-center mx-1 mb-3">
        <div>Maturity</div>
        <span className="p-1">Average Returns</span>
      </div>
      <div className="flex justify-between mb-3">
        <div className="font-semibold">{investmentData?.maturity}</div>
        <span className="p-1 text-green-500 text-xs bg-green-100 rounded-xl flex items-center mx-1">
          +5.2% <FaArrowUp className="text-green-500 ml-1" />
        </span>
      </div>
      <div className="flex flex-col gap-3">
        <div className="text-xs text-gray-400">Minimum Investment</div>
        <span className="font-semibold"> ${investmentData?.minimum}</span>
      </div>
      <motion.button
        whileTap={{ scale: 0.94 }}
        className="flex justify-center bg-[#1e3d34] hover:scale-105 w-full duration-200 ease-out items-center rounded-lg py-2 px-3 gap-2 text-white font-semibold mt-3 cursor-pointer"
        onClick={handleInvest}
      >
        Invest <FaArrowRight />
      </motion.button>
    </div>
  );
};

export default MagicCard;
