export type SkillLevel = "expert" | "advanced" | "intermediate";

export interface Skill {
  id: string;
  name: string;
  level: SkillLevel;
  descriptionKey: string;
}

export const SKILLS: Record<string, Skill[]> = {
  expert: [
    {
      id: "react",
      name: "React",
      level: "expert",
      descriptionKey: "react_desc",
    },
    {
      id: "angular",
      name: "Angular",
      level: "expert",
      descriptionKey: "angular_desc",
    },
    {
      id: "ts",
      name: "TypeScript",
      level: "expert",
      descriptionKey: "ts_desc",
    },
    {
      id: "svelte",
      name: "Svelte",
      level: "expert",
      descriptionKey: "svelte_desc",
    },
  ],
  advanced: [
    {
      id: "java",
      name: "Java (Spring)",
      level: "advanced",
      descriptionKey: "java_desc",
    },
    {
      id: "go",
      name: "Go (Golang)",
      level: "advanced",
      descriptionKey: "go_desc",
    },
    {
      id: "git",
      name: "Git",
      level: "advanced",
      descriptionKey: "git_desc",
    },
  ],
  intermediate: [
    {
      id: "csharp",
      name: "C# & Unity",
      level: "intermediate",
      descriptionKey: "csharp_desc",
    },
    {
      id: "docker",
      name: "Docker & Linux",
      level: "intermediate",
      descriptionKey: "docker_desc",
    },
  ],
};
