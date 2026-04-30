"use client";

import { motion } from "framer-motion";
import { UserLock01Icon, ArrowLeft01Icon } from "hugeicons-react";
import Link from "next/link";

export function PrivateProfile() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 py-16 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center gap-5"
      >
        <motion.div
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="w-20 h-20 rounded-full bg-[#EFEFEB] flex items-center justify-center"
        >
          <UserLock01Icon size={36} color="#8A8A82" />
        </motion.div>

        <motion.div
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.18, duration: 0.4 }}
        >
          <h1 className="text-[22px] sm:text-[26px] font-[700] text-[#1A1A18]" style={{ fontFamily: "'Fraunces', serif" }}>
            This profile is private
          </h1>
          <p className="text-[14px] text-[#8A8A82] mt-2 max-w-xs">
            This user has set their profile to private. You can still view their listings on the marketplace.
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.26, duration: 0.4 }}
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0D3B2E] text-[#FAFAF8] rounded-[10px] font-[600] text-[14px] hover:bg-[#0A2E24] transition-colors"
          >
            <ArrowLeft01Icon size={16} />
            Back to Browse
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
