export interface Repository<T> {
  add(item: Partial<T>, ...args: Array<unknown>): Promise<T>;
  delete(_id: string): Promise<boolean>;
  edit(_id: string, item: Partial<T>): Promise<T>;
  exists(_id: string): Promise<boolean>;
  get(_id: string): Promise<T | undefined>;
  getAll(): Promise<Array<T>>;
  query(where: Record<keyof T, any>): Promise<Array<T>>;
}
