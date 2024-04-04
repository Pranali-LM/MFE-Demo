import { AbbreviateNumberPipe } from './abbreviate-number.pipe';

describe('AbbreviateNumberPipe', () => {
  const pipe = new AbbreviateNumberPipe();

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return `0`  as `0`', () => {
    expect(pipe.transform(0)).toBe(0);
  });

  it('should return `8.7`  as `9`', () => {
    expect(pipe.transform(8.7)).toBe(9);
  });

  it('should return `17.5`  as `18`', () => {
    expect(pipe.transform(17.5)).toBe(18);
  });

  it('should return `200.324`  as `200`', () => {
    expect(pipe.transform(200.324)).toBe(200);
  });

  it('should return `1000.3`  as `1000`', () => {
    expect(pipe.transform(1000.3)).toBe(1000);
  });

  it('should return `1645.3345`  as `1645`', () => {
    expect(pipe.transform(1645.3345)).toBe(1645);
  });

  it('should return `10256.43`  as `10.25K`', () => {
    expect(pipe.transform(10256.43)).toBe('10.26K');
  });

  it('should return `123256.43`  as `123.26K`', () => {
    expect(pipe.transform(123256.43)).toBe('123.26K');
  });

  it('should return `999995 `  as `1M` (Special case1=> 1M instead 999.99K)', () => {
    expect(pipe.transform(999995)).toBe('1M');
  });

  it('should return `999265.44 `  as `1M` (Special case2 => 1M instead 999.99K)', () => {
    expect(pipe.transform(999965.44)).toBe('1M');
  });

  it('should return `2350100.67 `  as `2.35M`', () => {
    expect(pipe.transform(2350100.67)).toBe('2.35M');
  });

  it('should return `12350100.67 `  as `12.35M`', () => {
    expect(pipe.transform(12350100.67)).toBe('12.35M');
  });

  it('should return `124350100.67 `  as `124.35M`', () => {
    expect(pipe.transform(124350100.67)).toBe('124.35M');
  });

  it('should return `13124350100.67 `  as `13.12B`', () => {
    expect(pipe.transform(13124350100.67)).toBe('13.12B');
  });
});
