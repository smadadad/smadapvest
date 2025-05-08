"use client";
import React, { useState } from "react";
import { LuLayoutDashboard } from "react-icons/lu";
import { BsGraphUp, BsChevronDown, BsQuestionCircle } from "react-icons/bs";
import { PiNotebookFill, PiClockClockwise } from "react-icons/pi";
import Link from "next/link";
import Logo from "@/app/components/Logo";

const NavItem = ({ href, icon: Icon, label }) => (
  <Link href={href}>
    <div className="flex gap-4 text-sm font-medium poppins items-center py-3 px-4 hover:bg-white rounded-md cursor-pointer transition-colors duration-200">
      <Icon className="text-xl text-gray-500" />
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </div>
  </Link>
);

const CollapsibleNavItem = ({ icon: Icon, label, links }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex gap-2 items-center py-3 px-4 text-sm font-medium poppins cursor-pointer hover:bg-white rounded-md transition-colors duration-200"
      >
        <Icon className="text-sm text-gray-500" />
        <p className="text-sm font-medium text-gray-700">{label}</p>
        <BsChevronDown
          className={`ml-auto text-sm text-gray-500 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </div>
      <div
        className={`flex flex-col gap-2 pl-8 pr-2 transition-all duration-300 overflow-hidden ${
          isOpen ? "max-h-96 py-2" : "max-h-0"
        }`}
      >
        {links.map((link, index) => (
          <NavItem
            key={index}
            href={link.href}
            icon={link.icon}
            label={link.label}
          />
        ))}
      </div>
    </div>
  );
};

const SideNav = ({ isOpen }) => {
  const investmentLinks = [
    { href: "#", icon: BsGraphUp, label: "Bond" },
    { href: "/dashboard/moneymarket", icon: BsGraphUp, label: "Money Market" },
    { href: "#", icon: BsGraphUp, label: "Equity" },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 h-screen w-64 bg-gray-100 z-40 shadow-lg transition-transform duration-300 transform
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 md:static md:shadow-none
      `}
    >
      <div className="flex flex-col justify-between h-full">
        <div className="py-10 px-6 overflow-y-auto">
          <div className="mb-5">
            <Logo />
          </div>

          <div className="text-xs flex flex-col gap-2">
            <NavItem
              href="/dashboard"
              icon={LuLayoutDashboard}
              label="Dashboard"
            />
            <CollapsibleNavItem
              icon={BsGraphUp}
              label="Investment"
              links={investmentLinks}
            />
            <NavItem
              href="/dashboard/portfolio"
              icon={PiNotebookFill}
              label="Portfolio"
            />
            <NavItem
              href="/dashboard/wallet"
              icon={PiNotebookFill}
              label="Wallet"
            />
            <NavItem
              href="/dashboard/history"
              icon={PiClockClockwise}
              label="Transaction History"
            />
          </div>
        </div>

        <div className="px-7 pt-3 pb-8 border-t border-gray-300 text-xs flex flex-col gap-3">
          <NavItem href="/support" icon={BsQuestionCircle} label="Contact Us" />
        </div>
      </div>
    </aside>
  );
};

export default SideNav;
