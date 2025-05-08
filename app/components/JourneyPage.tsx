"use client";

import { motion } from "motion/react";
import BANK_ICON from "@/assets/bank.svg";
import DOLLAR_ICON from "@/assets/dollar.svg";
import BRICK_ICON from "@/assets/brick.svg";
import Image from "next/image";

const cards = [
  {
    icon: BRICK_ICON,
    title: "Fund It Your Way",
    text: "Decide how much you want to invest. See your expected return before you continue.",
  },
  {
    icon: DOLLAR_ICON,
    title: "Smart Returns",
    text: "Choose your investment style. Earn based on your risk preference.",
  },
  {
    icon: BANK_ICON,
    title: "Trusted & Secure",
    text: "Your investment is protected. Backed by reliable financial institutions.",
  },
];

export default function JourneySection() {

  const cardAnimation = {
    initial: { opacity: 0, y: 40 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" },
  };

  return (
    <section className="py-14 w-full mt-4 bg-[#F5F5F5] flex flex-col items-center gap-8  mx-6 md:mx-8 lg:mx-20">
      <motion.header
        className="text-[32px] flex justify-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        Your Journey Starts Here
      </motion.header>

      <div className="flex flex-col lg:flex-row items-center gap-4 justify-center lg:justify-between">
        {cards.map((card, index) => {
         
         

          return (
            <motion.section
              
              key={index}
              className="p-8 rounded-[6px] border border-[#EAEAEA] bg-[#fafafa] w-full lg:w-fit lg:max-w-80 xl:max-w-96 cursor-pointer hover:bg-[#A7E3D2]/15 hover:-translate-y-1 duration-500 ease-in-out shadow-[4px_4px_0px_black]"
              style={{
                boxShadow: "0.869px 0.869px 1.738px 0px rgba(0, 0, 0, 0.04)",
              }}
              initial="initial"
              animate={"initial"}
              transition={{ delay: 0.1 * index, ...cardAnimation.transition }}
              whileInView={"animate"}
              viewport={{ once: true, margin: "-100px" }}
              variants={cardAnimation}
            >
              <span>
                <Image src={card.icon} alt="icon" />
              </span>

              <div className="flex flex-col gap-2 mt-4">
                <h1 className="font-medium text-[#2E2E2E]">{card.title}</h1>
                <span className="text-sm leading-6">{card.text}</span>
              </div>
            </motion.section>
          );
        })}
      </div>
    </section>
  );
}
