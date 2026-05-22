export interface Rectangular {
  getWidth(): number;
  getHeight(): number;
}

export class Rectangle implements Rectangular {
  constructor(
    private width: number,
    private height: number,
  ) {}

  public getWidth(): number {
    return this.width;
  }

  public getHeight(): number {
    return this.height;
  }

  public toString(): string {
    return `Rectangle(${this.height}, ${this.width})`;
  }
}

export class Calculator {
  public static getArea(rectangle: Rectangular): number {
    return rectangle.getWidth() * rectangle.getHeight();
  }

  public static getPerimeter(rectangle: Rectangular): number {
    return 2 * rectangle.getWidth() + 2 * rectangle.getHeight();
  }

  public static getDiagonal(rectangle: Rectangular): number {
    return Math.sqrt(
      Math.pow(rectangle.getHeight(), 2) + Math.pow(rectangle.getWidth(), 2),
    );
  }

  public static getWidthHeightRatio(rectangle: Rectangular): number {
    return rectangle.getWidth() / rectangle.getHeight();
  }
}
