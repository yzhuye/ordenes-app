export interface Command<R = any> {
  execute(): Promise<R>;
}
