import localFont from "next/font/local";

export const pretendard = localFont({
  src: "./fonts/PretendardVariable.woff2",
  display: "swap",
  variable: "--font-pretendard",
  weight: "45 920",
  fallback: ["Apple SD Gothic Neo", "system-ui", "sans-serif"],
});

export const gmarketSans = localFont({
  src: [
    { path: "./fonts/GmarketSansMedium.woff2", weight: "500", style: "normal" },
    { path: "./fonts/GmarketSansBold.woff2", weight: "700", style: "normal" },
  ],
  display: "swap",
  variable: "--font-gmarket-sans",
  fallback: ["Pretendard", "Apple SD Gothic Neo", "sans-serif"],
});
