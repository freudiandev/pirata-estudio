"use client";

import { motion } from "framer-motion";

type Mood = "calm" | "warn" | "stress";

export function PirateMascot({
  mood = "calm",
  compact = false,
}: {
  mood?: Mood;
  compact?: boolean;
}) {
  const eyeY = mood === "stress" ? 26 : 24;
  const mouth =
    mood === "calm"
      ? "M 44 57 C 49 63 59 63 64 57"
      : mood === "warn"
        ? "M 45 58 C 50 55 58 55 63 58"
        : "M 45 60 C 50 56 58 56 63 60";
  const brow = mood === "stress" ? -4 : mood === "warn" ? -2 : 0;
  const size = compact ? 68 : 220;

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 140 140"
      initial={{ y: 6, rotate: -1 }}
      animate={{ y: [6, 0, 6], rotate: [-1, 1, -1] }}
      transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      aria-hidden="true"
    >
      <ellipse cx="70" cy="124" rx="44" ry="8" fill="#d8e7ef" />
      <circle cx="71" cy="62" r="36" fill="#ffd6b3" />
      <path d="M 28 45 C 42 16 94 16 110 46 L 102 74 L 36 74 Z" fill="#123b62" />
      <path d="M 32 48 L 70 17 L 108 48 Z" fill="#e06653" />
      <rect x="44" y="40" width="52" height="8" rx="4" fill="#f8f5ef" />
      <rect x="58" y="36" width="24" height="16" rx="3" fill="#f2c14f" />
      <path d="M 38 72 C 48 90 93 90 103 72 L 96 96 L 43 96 Z" fill="#f7f3eb" />
      <circle cx="54" cy={eyeY} r="4.5" fill="#123b62" />
      <circle cx="77" cy={eyeY} r="4.5" fill="#123b62" />
      <path d={`M 48 ${20 + brow} L 60 ${18 + brow}`} stroke="#123b62" strokeWidth="3" strokeLinecap="round" />
      <path d={`M 71 ${18 + brow} L 83 ${20 + brow}`} stroke="#123b62" strokeWidth="3" strokeLinecap="round" />
      <path d={mouth} stroke="#d66a5b" strokeWidth="3" strokeLinecap="round" fill="none" />
      <circle cx="89" cy="47" r="8" fill="#f8f5ef" />
      <circle cx="89" cy="47" r="4" fill="#123b62" />
      <path d="M 14 47 C 6 40 7 28 19 26 C 28 25 36 32 33 42 C 30 52 23 57 14 55 Z" fill="#6bc29b" />
      <path d="M 19 55 C 35 50 43 59 45 71 C 35 72 28 76 23 86 C 18 76 16 65 19 55 Z" fill="#3e8f72" />
      <circle cx="22" cy="36" r="3" fill="#123b62" />
      <path d="M 9 39 L 1 43 L 11 47 Z" fill="#f2c14f" />
      <path d="M 17 42 C 25 45 28 50 28 56" stroke="#f8f5ef" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M 102 87 C 100 108 84 118 71 118 C 56 118 42 109 39 87" stroke="#123b62" strokeWidth="6" strokeLinecap="round" fill="none" />
    </motion.svg>
  );
}
