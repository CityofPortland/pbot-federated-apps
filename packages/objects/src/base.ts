export type BaseType = {
  id: string;
};

export type BaseChangeableType = BaseType & {
  created: Date;
  updated: Date;
};

export type BaseUserChangeableType = BaseChangeableType & {
  creator: string;
  updater: string;
};
