"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const quotes = [
  {
    text: "Ora et labora. Bekerja dan berdoa.",
    author: "Motto Methodist 1",
  },
  {
    text: "Takut akan TUHAN adalah permulaan pengetahuan, tetapi orang bodoh menghina hikmat dan didikan.",
    author: "Amsal 1:7",
  },
  {
    text: "Demikian juga halnya dengan iman: jika tidak disertai perbuatan, maka iman itu pada dirinya sendiri sudah mati",
    author: "Yakobus 2:17",
  },
];

export function AuthQuote() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % quotes.length);
    }, 5000); // Change every 5 seconds

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-6 max-w-lg min-h-[140px]">
      <blockquote className="space-y-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="space-y-4"
          >
            <p className="text-xl font-medium leading-relaxed">
              &quot;{quotes[index].text}&quot;
            </p>
            <footer className="text-sm font-medium text-white/80 flex items-center gap-2">
              <span className="w-8 h-px bg-white/50" />
              {quotes[index].author}
            </footer>
          </motion.div>
        </AnimatePresence>
      </blockquote>

      {/* Visual Indicator/Dots */}
      <div className="flex gap-2">
        {quotes.map((_, i) => (
          <div
            key={i}
            className={`h-1 rounded-full transition-all duration-300 ${
              i === index ? "w-6 bg-white" : "w-1 bg-white/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
