import { DistancePipe } from '@app-shared/pipes/distance/distance.pipe';

describe('Pipe: Distance pipe to Convert KM to Miles', () => {
  let pipe: DistancePipe;

  beforeEach(() => {
    pipe = new DistancePipe();
  });

  it('should return 1km as 0.621371', () => {
    expect(pipe.transform(1, 'miles')).toEqual(0.621371);
  });

  it('should return 0km as 0', () => {
    expect(pipe.transform(0, 'miles')).toEqual(0);
  });

  it('should return the entered value when `to` is wrong', () => {
    expect(pipe.transform(1, 'xyz')).toEqual(1);
  });
});
