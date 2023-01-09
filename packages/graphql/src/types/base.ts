export const baseDefs = `
_id: ID!
`;

export const changeableDefs = `
${baseDefs}
_created: Date!
_changed: Date!
`;

export const userChangeableDefs = `
${changeableDefs}
_createdBy: ID!
_changedBy: ID!
`;
