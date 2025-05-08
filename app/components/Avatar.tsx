import React, { useEffect, useState } from "react";

const getInitials = (name) => {
  if (!name) return "?";
  const words = name.split(" ").filter(Boolean);
  return words.length > 1
    ? words[0][0].toUpperCase() + words[1][0].toUpperCase()
    : words[0][0].toUpperCase();
};

const getRandomColor = () => {
  const colors = [
    "#FF5733",
    "#33FF57",
    "#3357FF",
    "#F4A261",
    "#E76F51",
    "#2A9D8F",
    "#E9C46A",
    "#264653",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

const Avatar = ({ name }) => {
  const initials = getInitials(name);
  const [bgColor, setBgColor] = useState("");

  useEffect(() => {
    // Check if we are in the browser (client-side)
    if (typeof window !== "undefined") {
      const storedColor = sessionStorage.getItem("avatarColor");

      if (storedColor) {
        setBgColor(storedColor); // Use the stored color
      } else {
        const newColor = getRandomColor(); // Generate a new color if none is stored
        sessionStorage.setItem("avatarColor", newColor); // Store it
        setBgColor(newColor); // Set the new color
      }
    }
  }, []);

  return (
    <div
      style={{
        width: "31.58px",
        height: "31.58px",
        borderRadius: "50%",
        backgroundColor: bgColor,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontSize: "14px",
        fontWeight: "bold",
        textTransform: "uppercase",
      }}
    >
      {initials}
    </div>
  );
};

export default Avatar;
