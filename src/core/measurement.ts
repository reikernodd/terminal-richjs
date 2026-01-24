/**
 * Represents a measurement of a renderable.
 */
export class Measurement {
  constructor(
    public readonly minimum: number,
    public readonly maximum: number
  ) {}

  /**
   * Clamps the measurement to a specific width.
   */
  clamp(width: number): number {
    if (width < this.minimum) return this.minimum;
    if (width > this.maximum) return this.maximum;
    return width;
  }

  /**
   * Creates a measurement with the same min and max.
   */
  static fixed(width: number): Measurement {
    return new Measurement(width, width);
  }
}
