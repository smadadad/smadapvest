"use client";

import { motion } from "framer-motion";

const DotLoader = () => (
  <div className="flex gap-1">
    {[0, 1, 2].map((i) => (
      <motion.span
        key={i}
        className="w-1.5 h-1.5 bg-white rounded-full"
        animate={{ y: [0, -4, 0] }}
        transition={{
          duration: 0.6,
          repeat: Infinity,
          repeatDelay: 0.1,
          delay: i * 0.2,
        }}
      />
    ))}
  </div>
);

export default DotLoader;
