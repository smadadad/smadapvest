"use client";
import SideNav from "./components/sideNav";
import TopNav from "./components/topNav";
import { useState } from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="montserrat h-screen flex w-full relative bg-gray-50">
      {/* Sidebar */}
      <SideNav isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* Overlay for mobile */}
      <div
        className={`fixed inset-0 bg-black/50 z-30 md:hidden transition-opacity duration-300 ${
          isSidebarOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden h-screen w-full z-0">
        <TopNav toggleSidebar={() => setIsSidebarOpen((prev) => !prev)} />
        <div
          className="flex-1 p-4 w-full overflow-y-scroll h-full
        "
        >
          {children}
        </div>
      </div>
    </div>
  );
}
