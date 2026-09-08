export type ConnectionRelationship =
  | "parent"
  | "child"
  | "sibling"
  | "partner"
  | "other";

/** The invitation describes the recipient relative to its sender. */
export function familyRelationship(
  relationship: ConnectionRelationship,
  viewerIsSender: boolean,
): ConnectionRelationship {
  if (viewerIsSender) return relationship;
  return relationship === "parent"
    ? "child"
    : relationship === "child"
      ? "parent"
      : relationship;
}
