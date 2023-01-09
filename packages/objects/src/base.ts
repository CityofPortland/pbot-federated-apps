export type BaseType = {
  _id: string;
};

export type BaseChangeableType = BaseType & {
  _created: Date;
  _changed: Date;
};

export type BaseUserChangeableType = BaseChangeableType & {
  _createdBy: string;
  _changedBy: string;
};
