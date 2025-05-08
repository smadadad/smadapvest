"use client";

import {
  motion,
  useMotionValue,
  useTransform,
  animate,
} from "framer-motion";
import { useEffect } from "react";

type HTMLContentProps = {
  targetValue: number;
  maxDecimals?: number; // default limit to 4
  duration?: number; // optional duration prop
};

export default function HTMLContent({
  targetValue,
  maxDecimals = 4,
  duration = 2,
}: HTMLContentProps) {
  const count = useMotionValue(0);

  // Auto-decide decimals, but limit how many digits appear after the decimal
  const formatted = useTransform(count, (latest) => {
    const decimalPart = latest.toString().split(".")[1];
    const decimalsToShow = decimalPart
      ? Math.min(decimalPart.length, maxDecimals)
      : 0;

    return Number(latest).toLocaleString(undefined, {
      minimumFractionDigits: decimalsToShow,
      maximumFractionDigits: decimalsToShow,
    });
  });

  useEffect(() => {
    // Make the animation smoother and slower by using spring and controlling the duration
    const controls = animate(count, targetValue, {
      type: "spring",
      stiffness: 50, // Controls the bounciness
      damping: 15, // Smoothens the movement
      duration: duration,
    });

    return () => controls.stop();
  }, [targetValue, duration]);

  return (
    <motion.pre style={text} className="poppins">
      {formatted}
    </motion.pre>
  );
}

const text = {
  fontSize: 20,
  color: "black",
};
