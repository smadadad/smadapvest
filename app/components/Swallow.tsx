import React from "react";

const SwallowIcon = () => {
  return (
    <button
      className="w-8 h-8 p-1 bg-[rgba(29,29,31,0.7)] backdrop-blur-lg border border-[rgba(66,66,69,0.7)] relative cursor-pointer"
      style={{ border: "none", background: "none", padding: "0", margin: "0" }}
    >
      <span className="w-6.5 h-2.25 absolute top-2.25 left-1.25 transition-transform duration-1000 cubic-bezier-[.86,0,.07,1]">
        <span
          className="w-3 h-0.5 bg-[#f5f5f7] absolute bottom-0 transition-transform duration-1000 cubic-bezier-[.86,0,.07,1] rounded-tl-lg"
          style={{
            transform: "rotate(40deg)",
            transformOrigin: "100% 100%",
          }}
        />
        <span
          className="w-3 h-0.5 bg-[#f5f5f7] absolute bottom-0 transition-transform duration-1000 cubic-bezier-[.86,0,.07,1] rounded-tr-lg"
          style={{
            transform: "rotate(-40deg)",
            transformOrigin: "0 100%",
          }}
        />
      </span>
    </button>
  );
};

export default SwallowIcon;
