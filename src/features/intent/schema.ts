import type { ServiceWorkflowSlug } from "@/features/services/availability";

export type RoutableIntent = ServiceWorkflowSlug | "benefit-application" | "documents";
export type WorkflowSlug = RoutableIntent | "service-unavailable";

export interface IntentContext {
  person: {
    id: string;
    name: string;
    maritalStatus: string;
    preferredLanguage?: string;
  };
  relationships: Array<{ name: string; relationship: string }>;
  obligations: Array<{ id: string; title: string; direction: string; status?: string }>;
  applications: Array<{ id: string; title: string; status: string }>;
  businesses: Array<{ id: string; name: string; entityType: string }>;
  availableWorkflows: RoutableIntent[];
}

export interface IntentResponse {
  route: WorkflowSlug;
  language: "en" | "hi" | "kn" | "hinglish";
  title: string;
  reply: string;
  steps: string[];
  clarification: string | null;
  simulated: true;
  authority: string;
}
