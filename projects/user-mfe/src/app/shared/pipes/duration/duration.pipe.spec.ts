import { DurationPipe } from '@app-shared/pipes/duration/duration.pipe';

describe('Pipe: Duration pipe', () => {
  let pipe: DurationPipe;

  beforeEach(() => {
    pipe = new DurationPipe();
  });

  it('should return `0`  as `0 min`', () => {
    expect(pipe.transform(0).toLowerCase()).toContain('0 min');
  });

  it('should return `-1`  as `undefined`', () => {
    expect(pipe.transform(-1)).toEqual(undefined);
  });

  it('should return `undefined`  as `undefined`', () => {
    expect(pipe.transform(-1)).toEqual(undefined);
  });

  it('should return `60` as `1 hr`', () => {
    expect(pipe.transform(60).toLowerCase()).toContain('1 hr');
  });

  it('should return `130` min as `2 hr 10 mins`', () => {
    expect(pipe.transform(130).toLowerCase()).toContain('2 hr 10 min');
  });
});
