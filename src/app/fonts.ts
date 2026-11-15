import { Dancing_Script, Montserrat, Tajawal } from "next/font/google";
import localFont from "next/font/local";

export const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-montserrat",
  display: "swap",
});

// Police arabe : géométrique et lisible, s'accorde avec Montserrat.
export const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "700", "800"],
  variable: "--font-arabic",
  display: "swap",
});

export const dancingScript = Dancing_Script({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-script",
  display: "swap",
});

export const photographSignature = localFont({
  src: "../assets/fonts/Photograph-Signature.ttf",
  variable: "--font-signature",
  display: "swap",
});

export const fontVariables = [montserrat, tajawal, dancingScript, photographSignature]
  .map((f) => f.variable)
  .join(" ");
