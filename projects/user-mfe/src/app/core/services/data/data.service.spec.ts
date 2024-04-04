import { DateService } from '@app-core/services/date/date.service';

describe('Date Service', () => {
  let dateService: DateService;

  beforeAll(() => {
    dateService = new DateService();
  });

  it('should convert data to ISO string', () => {
    const data = dateService.toISOString(new Date('1-1-2018'));

    expect(typeof data).toBe('string');
    expect(data).toBe('2017-12-31T18:30:00.000Z');
  });

  it('should convert Data`s time to 12am', () => {
    const date = dateService.toDaysStartISO(new Date());

    expect(date).toContain('T18:30:00.000Z');
  });

  it('should convert Data`s time to 11.59pm', () => {
    const date = dateService.toDaysEndISO(new Date());

    expect(date).toContain('T18:29:59.999Z');
  });

  it('return a date range for past 7 days', () => {
    const dateRange = dateService.getDateRangeInISO(7);

    expect(dateRange).toBeTruthy();
    expect(dateRange.from).toBeTruthy();
    expect(dateRange.to).toBeTruthy();
    expect(dateRange.from).toContain('T18:30:00.000Z');
    expect(dateRange.to).toContain('T18:29:59.999Z');
    expect(typeof dateRange.from).toBe('string');
    expect(typeof dateRange.to).toBe('string');
  });
});
