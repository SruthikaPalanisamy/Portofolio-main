import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
const CopyEmailButton = () => {
 return (
    <motion.a
      href="/assets/Resume_Sruthika.pdf"
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ y: -5 }}
      whileTap={{ scale: 1.05 }}
      className="relative px-1 py-4 text-sm text-center rounded-full font-extralight bg-primary w-[12rem] cursor-pointer overflow-hidden flex items-center justify-center"
    >
      <p className="flex items-center justify-center gap-2">
        <img src="assets/logos/doc.jpg" className="w-5" alt="resume icon" />
        View Resume
      </p>
    </motion.a>
  );
};

export default CopyEmailButton;
