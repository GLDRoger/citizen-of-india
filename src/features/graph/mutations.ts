import {
  graphEdgeSchema,
  graphNodeSchema,
  type CitizenGraph,
  type GraphEvent,
  type GraphMutation,
  type GraphNode,
} from "./schema";

function assertUniqueId(items: ReadonlyArray<{ id: string }>, id: string, label: string) {
  if (items.some((item) => item.id === id)) {
    throw new Error(`${label} with id ${id} already exists.`);
  }
}

function patchNode(node: GraphNode, mutation: Extract<GraphMutation, { type: "patchAttrs" }>) {
  if (node.id !== mutation.nodeId) {
    return node;
  }

  return graphNodeSchema.parse({
    ...node,
    attrs: { ...node.attrs, ...mutation.attrs },
    verification: mutation.verification ?? node.verification,
  });
}

export function applyMutation(graph: CitizenGraph, mutation: GraphMutation): CitizenGraph {
  switch (mutation.type) {
    case "addNode": {
      assertUniqueId(graph.nodes, mutation.node.id, "Node");
      return { ...graph, nodes: [...graph.nodes, graphNodeSchema.parse(mutation.node)] };
    }
    case "addEdge": {
      assertUniqueId(graph.edges, mutation.edge.id, "Edge");
      const nodeIds = new Set(graph.nodes.map((node) => node.id));
      if (!nodeIds.has(mutation.edge.from) || !nodeIds.has(mutation.edge.to)) {
        throw new Error(`Edge ${mutation.edge.id} refers to an unknown node.`);
      }
      return { ...graph, edges: [...graph.edges, graphEdgeSchema.parse(mutation.edge)] };
    }
    case "endEdge": {
      const exists = graph.edges.some((edge) => edge.id === mutation.edgeId);
      if (!exists) {
        throw new Error(`Cannot end unknown edge ${mutation.edgeId}.`);
      }
      return {
        ...graph,
        edges: graph.edges.map((edge) =>
          edge.id === mutation.edgeId
            ? { ...edge, validTo: mutation.validTo, status: "ended" }
            : edge,
        ),
      };
    }
    case "patchAttrs": {
      const exists = graph.nodes.some((node) => node.id === mutation.nodeId);
      if (!exists) {
        throw new Error(`Cannot patch unknown node ${mutation.nodeId}.`);
      }
      return { ...graph, nodes: graph.nodes.map((node) => patchNode(node, mutation)) };
    }
    default: {
      const exhaustive: never = mutation;
      return exhaustive;
    }
  }
}

export function applyTransaction(graph: CitizenGraph, event: GraphEvent): CitizenGraph {
  const updatedGraph = event.mutations.reduce(applyMutation, graph);
  return { ...updatedGraph, events: [...updatedGraph.events, event] };
}

export function createGraphEvent(input: Omit<GraphEvent, "id" | "occurredAt">): GraphEvent {
  return {
    ...input,
    id: `evt:${crypto.randomUUID()}`,
    occurredAt: new Date().toISOString(),
  };
}
