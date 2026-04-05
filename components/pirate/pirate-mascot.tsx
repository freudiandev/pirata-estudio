"use client";

import { motion } from "framer-motion";

type Mood = "calm" | "warn" | "stress";

const expressions: Record<
  Mood,
  {
    mouth: string;
    browLeft: string;
    browRight: string;
    eyeScaleY: number;
    cheek: string;
  }
> = {
  calm: {
    mouth: "M 84 114 C 91 121 105 121 112 114",
    browLeft: "M 76 80 C 82 76 88 76 94 79",
    browRight: "M 106 79 C 112 76 118 76 124 80",
    eyeScaleY: 1,
    cheek: "#f5a79f",
  },
  warn: {
    mouth: "M 84 116 C 92 111 104 111 112 116",
    browLeft: "M 75 79 C 82 73 89 73 95 77",
    browRight: "M 105 77 C 111 73 118 73 125 79",
    eyeScaleY: 0.85,
    cheek: "#ef9b8f",
  },
  stress: {
    mouth: "M 84 118 C 92 110 104 110 112 118",
    browLeft: "M 74 78 C 82 69 90 69 96 75",
    browRight: "M 104 75 C 110 69 118 69 126 78",
    eyeScaleY: 0.7,
    cheek: "#ea8b85",
  },
};

export function PirateMascot({
  mood = "calm",
  compact = false,
}: {
  mood?: Mood;
  compact?: boolean;
}) {
  const size = compact ? 72 : 252;
  const expression = expressions[mood];

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      className="overflow-visible"
    >
      <motion.g
        initial={{ y: 4, rotate: -1.2 }}
        animate={{ y: [4, -2, 4], rotate: [-1.2, 1.2, -1.2] }}
        transition={{ duration: 6, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        style={{ transformOrigin: "100px 106px" }}
      >
        <ellipse cx="102" cy="184" rx="54" ry="10" fill="#d9e9ef" />

        <g transform="translate(24 98)">
          <path
            d="M 18 26 C 6 12 10 -10 30 -8 C 48 -6 55 12 48 26 C 44 34 36 40 24 40 C 20 40 18 35 18 26 Z"
            fill="#73c79e"
          />
          <path
            d="M 25 41 C 44 36 59 44 63 58 C 49 59 38 65 31 78 C 22 67 19 54 25 41 Z"
            fill="#3f9477"
          />
          <path d="M 15 23 L 2 28 L 16 34 Z" fill="#f3bf55" />
          <circle cx="27" cy="8" r="4.2" fill="#153a5d" />
          <path
            d="M 24 17 C 33 19 39 25 40 33"
            fill="none"
            stroke="#f4f8f2"
            strokeLinecap="round"
            strokeWidth="2.6"
          />
          <path
            d="M 19 26 C 26 30 36 31 44 28"
            fill="none"
            stroke="#2d6d59"
            strokeLinecap="round"
            strokeWidth="2"
          />
        </g>

        <path
          d="M 72 139 C 82 133 119 133 130 139 L 138 169 C 124 177 79 177 64 169 Z"
          fill="#f4f7fb"
        />
        <path
          d="M 57 170 C 61 145 75 135 100 135 C 125 135 139 145 143 170 C 130 180 70 180 57 170 Z"
          fill="#0f3f69"
        />
        <path d="M 96 137 L 104 137 L 109 168 L 91 168 Z" fill="#f2c14f" />
        <circle cx="100" cy="146" r="4" fill="#f8efe2" />

        <path d="M 68 72 C 76 57 91 49 109 49 C 127 49 142 57 150 72" fill="#f6c6a0" />
        <circle cx="100" cy="95" r="42" fill="#ffd9b8" />
        <circle cx="61" cy="96" r="8" fill="#f6c6a0" />
        <circle cx="139" cy="96" r="8" fill="#f6c6a0" />

        <path
          d="M 58 78 C 64 46 88 33 111 33 C 136 33 156 48 160 77 L 149 101 C 140 87 122 80 101 80 C 80 80 63 88 51 103 Z"
          fill="#123b62"
        />
        <path d="M 58 78 L 101 40 L 144 78 Z" fill="#e66a58" />
        <path d="M 145 77 C 156 80 162 89 163 101 C 152 99 146 92 143 84 Z" fill="#cc5749" />
        <rect x="65" y="69" width="70" height="10" rx="5" fill="#fff8ef" />
        <rect x="89" y="64" width="22" height="20" rx="4" fill="#f2c14f" />

        <path
          d="M 69 133 C 78 145 90 151 100 151 C 110 151 122 145 131 133"
          fill="#fff8ef"
          opacity="0.9"
        />

        <path
          d={expression.browLeft}
          fill="none"
          stroke="#163a5b"
          strokeLinecap="round"
          strokeWidth="3.6"
        />
        <path
          d={expression.browRight}
          fill="none"
          stroke="#163a5b"
          strokeLinecap="round"
          strokeWidth="3.6"
        />

        <path
          d="M 69 93 C 74 86 83 85 89 91 C 84 97 74 98 69 93 Z"
          fill="#163a5b"
          opacity="0.14"
        />
        <path d="M 68 91 C 76 84 86 84 94 91" fill="none" stroke="#163a5b" strokeWidth="4" />
        <circle cx="81" cy="92" r="9.5" fill="#fffaf4" />
        <circle cx="81" cy="92" r="4.5" fill="#163a5b" />
        <circle cx="84" cy="89" r="1.7" fill="#ffffff" />
        <path d="M 61 92 L 71 92" fill="none" stroke="#163a5b" strokeLinecap="round" strokeWidth="3" />

        <g transform={`translate(115 92) scale(1 ${expression.eyeScaleY})`}>
          <path d="M -10 0 C -5 -7 5 -7 10 0 C 5 7 -5 7 -10 0 Z" fill="#fffaf4" />
          <circle cx="0" cy="0" r="4.2" fill="#163a5b" />
          <circle cx="2.5" cy="-2.5" r="1.6" fill="#ffffff" />
        </g>

        <path
          d="M 98 99 C 100 103 100 108 97 111"
          fill="none"
          stroke="#d48773"
          strokeLinecap="round"
          strokeWidth="2.6"
        />

        <ellipse cx="74" cy="107" rx="6.5" ry="4.2" fill={expression.cheek} opacity="0.35" />
        <ellipse cx="124" cy="107" rx="6.5" ry="4.2" fill={expression.cheek} opacity="0.35" />

        <path
          d={expression.mouth}
          fill="none"
          stroke="#d6685c"
          strokeLinecap="round"
          strokeWidth="3.6"
        />

        <path
          d="M 88 126 C 95 130 106 130 113 126"
          fill="none"
          stroke="#f1c5b3"
          strokeLinecap="round"
          strokeWidth="3"
        />
      </motion.g>
    </motion.svg>
  );
}
