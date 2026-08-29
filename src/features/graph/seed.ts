import seedJson from "@/data/seed.json";
import { seedSchema, type CitizenGraph } from "./schema";

const seed = seedSchema.parse(seedJson);

export const seedMeta = seed.meta;
export const seedLogins = seed.logins;

export function createSeedGraph(): CitizenGraph {
  return structuredClone({
    nodes: seed.nodes,
    edges: seed.edges,
    events: seed.events,
  });
}
