export class Token {
  public readonly key: string;
  public readonly locations: string[];

  private _value!: string;

  constructor(key: string, ...locations: string[]) {
    this.key = key;
    this.locations = locations;
  }

  value() {
    return this._value = this._value || this._firstValue();
  }

  private _firstValue() {
    for (const location of this.locations) {
      const value = process.env[location];

      if (value) return value;
    }

    throw new Error(`No matching environment variable found in locations "${this.locations.join(', ')}".`);
  }
}
