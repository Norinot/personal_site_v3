export interface Project {
  id: string;
  date: string;
  tags: string[];
  icon: string;
  link: string;
}

export const PROJECTS: Project[] = [
  {
    id: "business-gpt",
    date: "2024",
    tags: ["React", "Svelte", "Python"],
    icon: "Layers",
    link: "https://www.telekom-mms.com/expertise/business-gpt",
  },
  {
    id: "ai4test",
    date: "2023 - 2024",
    tags: ["React", "Go"],
    icon: "Cpu",
    link: "#",
  },
  {
    id: "saray-webshop",
    date: "2024",
    tags: ["Angular", "Go"],
    icon: "ExternalLink",
    link: "https://sarayszonyeg.hu/",
  },
  {
    id: "mapa-crm",
    date: "Present",
    tags: ["Angular", "Java Spring Boot"],
    icon: "Terminal",
    link: "#",
  },
];
