import { PROFILE } from "@/content/profile";

export interface WizardStep {
  key: "name" | "email" | "kind" | "msg";
  questionKey: string;
  hintKey: string;
}

export const HIRE_STEPS: WizardStep[] = [
  { key: "name", questionKey: "terminal.wizard.qName", hintKey: "terminal.wizard.hName" },
  { key: "email", questionKey: "terminal.wizard.qEmail", hintKey: "terminal.wizard.hEmail" },
  { key: "kind", questionKey: "terminal.wizard.qKind", hintKey: "terminal.wizard.hKind" },
  { key: "msg", questionKey: "terminal.wizard.qMsg", hintKey: "terminal.wizard.hMsg" },
];

export function buildMailtoHref(data: Record<string, string>, subjectPrefix: string): string {
  const subject = `${subjectPrefix} ${data.kind || "general"}`;
  const body = `Hi,\n\n${data.msg || ""}\n\n— ${data.name || ""}\n${data.email || ""}`;
  return `mailto:${PROFILE.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
