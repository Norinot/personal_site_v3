export interface ServiceItem {
  id: string;
  iconName: string;
}

export const SERVICES: ServiceItem[] = [
  { id: "consulting", iconName: "users" },
  { id: "frontendDevelopment", iconName: "code" },
  { id: "backendDevelopment", iconName: "server" },
  { id: "maintenanceAndSupport", iconName: "cog" },
];
