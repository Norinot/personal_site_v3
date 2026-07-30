import { PROJECTS, type Project } from "@/content/projects";

export function findProject(query: string): Project | undefined {
  const q = query.toLowerCase();
  return PROJECTS.find(
    (p) => p.id.toLowerCase().includes(q) || p.id.toLowerCase().replace(/-/g, " ").includes(q),
  );
}
