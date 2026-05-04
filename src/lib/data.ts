import {
  Anvil,
  Building2,
  Drill,
  Factory,
  Hammer,
  HardHat,
  Layers3,
  Scissors,
  Ruler,
  ShieldCheck,
  Sparkles,
  Wrench
} from "lucide-react";

export const services = [
  {
    title: "Industrial Fabrication",
    slug: "industrial-fabrication",
    icon: Factory,
    summary: "Machine frames, structural assemblies, custom fabricated metal parts, and industrial supports.",
    details: ["Machine frames", "Structural assemblies", "Custom metal parts", "Industrial supports"]
  },
  {
    title: "Structural Fabrication",
    slug: "structural-fabrication",
    icon: Building2,
    summary: "Warehouse sheds, industrial sheds, mezzanine floors, roofing structures, and plant support frames.",
    details: ["Warehouse sheds", "Industrial sheds", "Mezzanine floors", "Roofing structures"]
  },
  {
    title: "ACP Support Structures",
    slug: "acp-support-structures",
    icon: Layers3,
    summary: "Fabricated support systems for ACP framework, front elevations, and commercial facades.",
    details: ["ACP framework", "Commercial ACP supports", "Front elevation support"]
  },
  {
    title: "Utility Fabrication",
    slug: "utility-fabrication",
    icon: ShieldCheck,
    summary: "Durable gates, railings, safety barriers, and site-specific utility structures.",
    details: ["Gates", "Railings", "Safety barriers"]
  },
  {
    title: "Installation Services",
    slug: "installation-services",
    icon: HardHat,
    summary: "On-site installation, structural fitting, and ACP support installation with practical site coordination.",
    details: ["On-site installation", "Structural fitting", "ACP support installation"]
  },
  {
    title: "Machining & Material Processing",
    slug: "machining-material-processing",
    icon: Scissors,
    summary: "Workshop preparation for fabrication jobs, including lathe machining, punching, drilling, cutting, and press cutting.",
    details: ["Lathe machining", "Punching", "Drilling", "Cutting", "Press cutting"]
  }
];

export const capabilities = [
  { label: "Welding", icon: Sparkles },
  { label: "Lathe machining", icon: Anvil },
  { label: "Punching", icon: Hammer },
  { label: "Drilling", icon: Drill },
  { label: "Cutting", icon: Wrench },
  { label: "Press cutting", icon: Ruler }
];

export const materials = ["MS pipe", "Angle", "Channel", "Sheet", "Profile sheet"];

export const trustPoints = [
  "3mm-20mm fabrication thickness capability",
  "Up to 2-floor mezzanine project capability",
  "Workshop-led quality control before dispatch",
  "Drawing-based quotation and site coordination"
];

export const projects = [
  {
    title: "Warehouse Shed Structure",
    category: "Warehouse sheds",
    location: "Bilaspur region",
    image: "/images/project-warehouse.svg",
    summary: "MS column, truss, and roofing support fabrication for industrial storage."
  },
  {
    title: "Oxygen Plant Shed",
    category: "Oxygen plant sheds",
    location: "Industrial site",
    image: "/images/project-oxygen.svg",
    summary: "Purpose-built shed framework with service access and equipment clearances."
  },
  {
    title: "Two-Floor Mezzanine",
    category: "Mezzanine floors",
    location: "Factory unit",
    image: "/images/project-mezzanine.svg",
    summary: "Load-conscious mezzanine frame for usable production and storage area."
  },
  {
    title: "Commercial ACP Framework",
    category: "ACP structures",
    location: "Commercial elevation",
    image: "/images/project-acp.svg",
    summary: "Facade support framework aligned for panel fixing and front elevation finish."
  },
  {
    title: "Industrial Main Gate",
    category: "Gates",
    location: "Plant entry",
    image: "/images/project-gate.svg",
    summary: "Heavy-duty gate fabrication designed for repeated industrial use."
  },
  {
    title: "Safety Railings",
    category: "Railings",
    location: "Workshop and access zones",
    image: "/images/project-railing.svg",
    summary: "Site-measured railing sections and safety barriers for controlled movement."
  }
];

export const projectCategories = ["All", "Warehouse sheds", "Oxygen plant sheds", "Mezzanine floors", "ACP structures", "Gates", "Railings"];

export const testimonials: Array<{
  quote: string;
  name: string;
  company: string;
}> = [];

export const capabilityBoxes = [
  {
    title: "Materials",
    value: materials.join(", "),
    description: "Common MS industrial sections and sheets used for frames, sheds, supports, and utilities."
  },
  {
    title: "Thickness",
    value: "3mm-20mm",
    description: "Fabrication thickness range for practical industrial and structural work."
  },
  {
    title: "Project capability",
    value: "Up to 2-floor mezzanine",
    description: "Suitable for workshop, storage, plant, and factory mezzanine applications."
  }
];

export const quoteProjectTypes = [
  "Industrial fabrication",
  "Warehouse shed",
  "Industrial shed",
  "Mezzanine floor",
  "ACP support structure",
  "Gate or railing",
  "Installation service",
  "Other fabrication work"
];

export type Service = (typeof services)[number];
export type Project = (typeof projects)[number];
