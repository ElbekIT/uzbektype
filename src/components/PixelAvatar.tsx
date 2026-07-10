import React from "react";

// Color Palette Definition for Retro Pixel Art
const PALETTE: Record<string, string> = {
  ".": "transparent",       // Background
  "H": "#5c3a21",           // Brown Hair (Dark)
  "h": "#825534",           // Brown Hair (Light)
  "R": "#b83535",           // Red Hair
  "W": "#dedede",           // White/Grey Hair
  "S": "#fed6b1",           // Skin Tone (Light)
  "s": "#e2a77f",           // Skin Tone (Medium)
  "D": "#8a583a",           // Skin Tone (Dark)
  "E": "#ffffff",           // Eye White
  "P": "#212121",           // Pupil (Black)
  "M": "#e53e3e",           // Mouth/Lips (Red)
  "m": "#b32a2a",           // Darker lips
  "C": "#38b2ac",           // Green Shirt (Teal)
  "B": "#3182ce",           // Blue Shirt
  "O": "#dd6b20",           // Orange Shirt
  "g": "#4a5568",           // Goggles/Glasses frame
  "L": "#e2e8f0",           // Goggle Lens
  "A": "#556b2f",           // Hat (Olive green)
  "K": "#feb2b2",           // Rosy cheeks (Pink)
  "X": "#1a1a1a",           // Black outline/accents
};

// Preset Avatars mapping the 6 presets shown in screenshots
const PRESETS: Record<string, string[]> = {
  // Preset 1: Brown-haired girl with red lips, green shirt, dark background.
  "avatar_1": [
    "....HHHHHHHH....",
    "...HHHHHHHHHH...",
    "..HHHHHHHHHHHH..",
    "..HHHSSSSSSHHH..",
    "..HHSSSSSSSSHH..",
    "..HHSEPESEPESH..",
    "..HHSSSSSSSSHH..",
    "...HSSSSSSSSH...",
    "...HSSSMMSSSH...",
    "....SSSSSSSS....",
    ".....SSSSSS.....",
    "....CCCCCCCC....",
    "...CCCCCCCCCC...",
    "..CCCCCCCCCCCC..",
    "..CCCCCCCCCCCC..",
    "...CCCCCCCCCC..."
  ],
  // Preset 2: Boy with brown hair, winking, blue shirt.
  "avatar_2": [
    "....hhhhhhhh....",
    "...hhhhhhhhhh...",
    "..hhhhhhhhhhhh..",
    "..hhhsssssshhh..",
    "..hhsssssssshh..",
    "..hhsepesxsshh..",
    "..hhsssssxxsshh..",
    "...hssssssssH...",
    "...hssMMMsssh...",
    "....ssssssss....",
    ".....ssssss.....",
    "....BBBBBBBB....",
    "...BBBBBBBBBB...",
    "..BBBBBBBBBBBB..",
    "..BBBBBBBBBBBB..",
    "...BBBBBBBBBB..."
  ],
  // Preset 3: Girl with long red hair, dark skin, white earrings.
  "avatar_3": [
    "....RRRRRRRR....",
    "...RRRRRRRRRR...",
    "..RRRRRRRRRRRR..",
    "..RRRDDDDDDDRR..",
    "..RRDDDDDDDDRR..",
    "..RRDEDPEDPEDR..",
    "..RRDDDDDDDDRR..",
    "..ERRDDDDDDRRE..",
    "..ERRDDMMDDRRE..",
    "...RRDDDDDDRR...",
    "....RDDDDDDR....",
    "....OOOOOOOO....",
    "...OOOOOOOOOO...",
    "..OOOOOOOOOOOO..",
    "..OOOOOOOOOOOO..",
    "...OOOOOOOOOO..."
  ],
  // Preset 4: Boy with goggles, green hat/helmet, green shirt.
  "avatar_4": [
    "....AAAAAAAA....",
    "...AAAAAAAAAA...",
    "..AAAAAAAAAAAA..",
    "..AAggggggAA..",
    "..AggLLggLLggA..",
    "..AgLPLggLPLgA..",
    "..AssssssssssA..",
    "...ssssssssss...",
    "...ssMMssssss...",
    "....ssssssss....",
    ".....ssssss.....",
    "....CCCCCCCC....",
    "...CCCCCCCCCC...",
    "..CCCCCCCCCCCC..",
    "..CCCCCCCCCCCC..",
    "...CCCCCCCCCC..."
  ],
  // Preset 5: Boy/girl with white hair, freckles/red cheeks, orange shirt.
  "avatar_5": [
    "....WWWWWWWW....",
    "...WWWWWWWWWW...",
    "..WWWWWWWWWWWW..",
    "..WWWSSSSSSWWW..",
    "..WWSSSSSSSSWW..",
    "..WWSEPESEPESW..",
    "..WWSKSSSSKSWW..",
    "...WSSKKKKSSW...",
    "...WssMMssssW...",
    "....WWSSSSWW....",
    ".....WSSSSW.....",
    "....OOOOOOOO....",
    "...OOOOOOOOOO...",
    "..OOOOOOOOOOOO..",
    "..OOOOOOOOOOOO..",
    "...OOOOOOOOOO..."
  ],
  // Preset 6: Boy with dark skin, brown curly hair, green shirt.
  "avatar_6": [
    "....HHHHHHHH....",
    "...HHHHHHHHHH...",
    "..HHHHHHHHHHHH..",
    "..HHHDDDDDDHHH..",
    "..HHDDDDDDDDHH..",
    "..HHDEDPEDPEDH..",
    "..HHDDDDDDDDHH..",
    "...HDDDDDDDDH...",
    "...HDDDMMDDDH...",
    "....DDDDDDDD....",
    ".....DDDDDD.....",
    "....CCCCCCCC....",
    "...CCCCCCCCCC...",
    "..CCCCCCCCCCCC..",
    "..CCCCCCCCCCCC..",
    "...CCCCCCCCCC..."
  ]
};

// Procedural generator helper to create dynamic random avatars based on seed
export function generateRandomAvatarString(): string {
  // Return random preset avatar ID
  const id = Math.floor(Math.random() * 6) + 1;
  return `avatar_${id}`;
}

interface PixelAvatarProps {
  avatarId: string;
  size?: number; // width/height in px
  className?: string;
}

export const PixelAvatar: React.FC<PixelAvatarProps> = ({ 
  avatarId, 
  size = 64, 
  className = "" 
}) => {
  // Default to avatar_1 if preset not found
  let grid = PRESETS[avatarId];
  if (!grid) {
    // If not a preset, try to fallback to dynamic hash or use avatar_1
    const idx = (avatarId.charCodeAt(0) % 6) + 1 || 1;
    grid = PRESETS[`avatar_${idx}`] || PRESETS["avatar_1"];
  }

  const cellSize = 100 / 16; // 16x16 grid

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={`rounded-lg overflow-hidden border border-neutral-800 bg-neutral-900 ${className}`}
      style={{ shapeRendering: "crispEdges" }}
    >
      {grid.map((row, rIdx) => {
        return row.split("").map((char, cIdx) => {
          const color = PALETTE[char] || "transparent";
          if (color === "transparent") return null;
          return (
            <rect
              key={`${rIdx}-${cIdx}`}
              x={cIdx * cellSize}
              y={rIdx * cellSize}
              width={cellSize + 0.1} // overlap slightly to prevent rendering gaps
              height={cellSize + 0.1}
              fill={color}
            />
          );
        });
      })}
    </svg>
  );
};

export const PRESET_AVATAR_IDS = ["avatar_1", "avatar_2", "avatar_3", "avatar_4", "avatar_5", "avatar_6"];
