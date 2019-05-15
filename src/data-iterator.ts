// No tests are provided for this class because it is strictly used in test files.

export class DataIterator<T> implements Iterator<T> {
  private _data: T[] = [];
  private _done: boolean = false;
  private _index: number = 0;

  constructor(...data: T[]) { this._data = data; }

  get done(): boolean { return this._done; }

  next(): IteratorResult<T> {
    return this._toIteratorResult(this._data[this._index++]);
  }

  private _hasNextValue(): boolean {
    return !!this._data[this._index + 1];
  }

  private _toIteratorResult(value: T): IteratorResult<T> {
    return { done: this._done = !this._hasNextValue(), value };
  }
}
