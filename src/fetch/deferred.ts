export class Deferred<T = void> {
    public promise: Promise<T>;
    public resolve!: (value: T | PromiseLike<T>) => void;
  
    constructor() {
      this.promise = new Promise<T>((resolve, _reject) => {
        this.resolve = resolve;
      });
    }
  }
  