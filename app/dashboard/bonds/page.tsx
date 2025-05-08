"use client";
import { IoInformationCircleOutline } from "react-icons/io5";
import { GiSettingsKnobs } from "react-icons/gi";
import MagicCard from "../components/magicCard";
import PaymentModal from "@/app/components/PaymentModal";
import { useState } from "react";

const Page = () => {
  const [showPayment, setShowPayment] = useState(false);
  const [investmentData, setInvestmentData] = useState(false);

  return (
    <>
      <div className="p-10">
        <div className="flex justify-between mb-20">
          <div>
            <p className="flex gap-2 items-center  text-xk font-semibold">
              Bond{" "}
              <IoInformationCircleOutline className="text-xl text-gray-400" />
            </p>
            <p className="text-xs text-gray-400">
              Explore reliable, fixed-term investments with regular returns.
            </p>
          </div>
          <div className="flex gap-3 items-center rounded-md px-8 border-[1px] border-gray-200 cursor-pointer">
            Filters <GiSettingsKnobs className="font-bold text-xl" />
          </div>
        </div>
        <div className="flex w-full flexwrap gap-3">
          <MagicCard
            setModalOpen={setShowPayment}
            setInvestmentData={setInvestmentData}
          />
        </div>
      </div>

      {showPayment && (
        <PaymentModal
          investmentData={investmentData}
          onClose={() => setShowPayment(false)}
        />
      )}
    </>
  );
};

export default Page;
