import ETH_MINI from "@/assets/eth-mini.svg";
import { useEffect } from "react";

const CustomSelect = ({
  selectedOption,
  setSelectedOption,
  isOpen,
  setIsOpen,
}) => {
  // Options list
  const options = [
    {
      value: "ETH",
      label: "ETH",
      image: ETH_MINI,
    },
    {
      value: "USDT",
      label: "USDT",
      image: ETH_MINI,
    },
    {
      value: "BNB",
      label: "BNB",
      image: ETH_MINI,
    },
  ];

  // Set default option (first option) if no option is selected
  useEffect(() => {
    if (!selectedOption) {
      setSelectedOption(options[0]); // Set first option as default
    }
  }, [selectedOption, setSelectedOption]);

  const handleSelectChange = (option) => {
    setSelectedOption(option);
    setIsOpen(false); // Close the dropdown after selection
  };

  return (
    <div className="relative w-full">
      {/* Custom Select Button */}
      <button
        className="w-full py-3 px-4 rounded-[4px] bg-[#F5F5F5] text-left flex items-center justify-between border border-gray-300 focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedOption ? (
          <div className="flex items-center">
            <img
              src={`data:image/svg+xml;utf8,${encodeURIComponent(ETH_MINI)}`}
              alt={selectedOption.label}
              className="w-6 h-6 mr-2"
            />

            <span>{selectedOption.label}</span>
          </div>
        ) : (
          <span>Select an option</span>
        )}
      </button>

      {/* Dropdown Options */}
      {isOpen && (
        <div className="absolute mt-2 w-full bg-white border border-gray-300 rounded-md shadow-lg z-10">
          {options.map((option) => (
            <div
              key={option.value}
              className="flex items-center px-4 py-3 cursor-pointer hover:bg-gray-100"
              onClick={() => handleSelectChange(option)}
            >
              <img
                src={option.image}
                alt={option.label}
                className="w-6 h-6 mr-2"
              />
              <span>{option.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
