import {
  Layers,
  Cpu,
  Terminal,
  ExternalLink,
  Github,
  Layout,
  Database,
  Settings,
  MessageSquare,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  layers: Layers,
  cpu: Cpu,
  terminal: Terminal,
  external: ExternalLink,
  github: Github,
  layout: Layout,
  database: Database,
  settings: Settings,
  consulting: MessageSquare,
};

export const getIcon = (iconName: string, size = 24) => {
  const IconComponent = iconMap[iconName.toLowerCase()] || Layers;
  return <IconComponent size={size} />;
};
