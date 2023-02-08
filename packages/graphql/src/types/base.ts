export const baseDefs = `
_id: ID!
`;

export const changeableDefs = `
${baseDefs}
_changed: DateTime!
_created: DateTime!
`;

export const userChangeableDefs = `
${changeableDefs}
_changedBy: ID!
_createdBy: ID!
`;
