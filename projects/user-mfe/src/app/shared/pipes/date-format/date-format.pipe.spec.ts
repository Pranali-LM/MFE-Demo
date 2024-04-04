import { DateFormatPipe } from '@app-shared/pipes/date-format.pipe';

describe('Pipe: Date Format Pipe', () => {
  let pipe: DateFormatPipe;

  beforeEach(() => {
    pipe = new DateFormatPipe();
  });

  it('convert a ISOFormat date string to mm/dd/yyyy hh:mm', () => {
    const dateString = new Date('2018-06-20T09:24:42.747Z').toISOString();
    expect(pipe.transform(dateString)).toBe('06/20/2018 09:24');
  });
});
