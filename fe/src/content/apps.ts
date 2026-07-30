export interface PersonalApp {
  id: string;
  icon: string;
  link: string;
  tags: string[];
}

export const APPS: PersonalApp[] = [
  {
    id: "forno",
    icon: "pizza",
    link: "https://forno.norinot.hu",
    tags: ["React"],
  },
];
