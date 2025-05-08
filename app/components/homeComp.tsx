import React from "react";
import { FaHandSparkles, FaArrowUp, FaArrowRight } from "react-icons/fa";

const HomeComp = ({ username, totalInvested, transactions }) => {
  return (
    <>
      <div className="font-semibold text-xl flex items-center">
        Welcome Back, {username || "User"}{" "}
        <FaHandSparkles className="text-yellow-500 text-xl ml-3 rotate-12" />
      </div>
      <div className="text-xs text-gray-400 flex items-center mb-16">
        Your portfolio has grown{" "}
        <span className="p-1 text-green-500 bg-green-100 rounded-xl flex items-center mx-1">
          +3.2% <FaArrowUp className="text-green-500" />
        </span>{" "}
        this week
      </div>
      <div className="flex flex-row gap-4 h-[55vh] overflow-hidden">
        <div className="border-[1px] border-gray-200 rounded-xl h-fit">
          <div className="p-5 border-b-[1px] border-gray-200 text-md font-semibold">
            Portfolio Overview{" "}
            <p className="text-sm font-light text-gray-400">
              See where your money is and how it’s growing
            </p>
          </div>
          <div className="p-5 flex flex-col">
            <div>
              <p className="text-sm font-light text-gray-400 pb-3">Total Balance</p>
              <p className="text-2xl font-semibold">{totalInvested} ETH</p>
              <div className="text-sm font-light text-gray-400 pb-3 flex items-center">
                <p>Earning (last 30 days)</p>
                <span className="p-1 text-green-500 bg-green-100 rounded-xl flex items-center mx-1">
                  +320% <FaArrowUp className="text-green-500 ml-1" />
                </span>
              </div>
            </div>
            <div className="flex gap-2 justify-center">
              <div className="border-[1px] border-gray-200 p-4 rounded-xl w-[20vw]">
                <div className="bg-amber-100 w-10 h-10 rounded-full mb-3"></div>
                <div className="mb-3">Money Market</div>
                <div className="flex justify-between">
                  <div>{totalInvested} ETH</div>
                  <span className="p-1 text-green-500 text-xs bg-green-100 rounded-xl flex items-center mx-1">
                    +320% <FaArrowUp className="text-green-500 ml-1" />
                  </span>
                </div>
              </div>
              {/* Add more dynamically later */}
            </div>
            <div className="p-4 w-fit rounded-lg bg-[#1e3d34] text-white font-semibold mt-5 flex items-center gap-2 hover:gap-3 duration-300 cursor-pointer">
              View Portfolio <FaArrowRight />
            </div>
          </div>
        </div>
        <div className="border-[1px] border-gray-200 rounded-xl w-full">
          <div className="border-b-[1px] border-gray-200 p-5">
            <div className="text-md font-semibold">Recent Activity</div>
            <div className="text-sm text-gray-400">Stay updated on what you’ve recently done</div>
          </div>
          {transactions.map((tx, index) => (
            <div key={index} className="border-b-[1px] border-gray-200 p-5">
              <div className="text-md font-semibold">
                You invested {tx.amount} ETH in {tx.type}
              </div>
              <div className="text-sm text-gray-400">{tx.timestamp}</div>
            </div>
          ))}
        </div>
      </div>
      {/* Rest of your UI can be updated later */}
    </>
  );
};

export default HomeComp;