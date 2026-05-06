import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const siteConfig = {
  name: "MARKS Engineering & Co.",
  shortName: "MARKS Engineering",
  location: "Bilaspur, Chhattisgarh, India",
  established: "2021",
  phone: "+91 93404 73578",
  whatsapp: "+91 93404 73578",
  email: "mec.cg2021@gmail.com",
  address: "Sirgitti, Industrial area, Bilaspur, Chhattisgarh, India",
  description:
    "Industrial fabrication and structural engineering company in Bilaspur, Chhattisgarh, specializing in sheds, mezzanine structures, ACP support frameworks, gates, railings, and custom metal work.",
  url: "https://marksengineering.co"
};

export function whatsappLink(message = "Hello MARKS Engineering, I want a fabrication quotation.") {
  return `https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(message)}`;
}
