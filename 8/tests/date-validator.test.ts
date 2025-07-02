import { DateValidator } from '../validators/date-validator';

describe('DateValidator', () => {
  let validator: DateValidator;

  beforeEach(() => {
    validator = new DateValidator();
  });

  describe('basic validation', () => {
    it('should validate Date objects', () => {
      const date = new Date('2023-01-01');
      const result = validator.validate(date);
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual(date);
      expect(result.errors).toBeUndefined();
    });

    it('should validate valid date strings', () => {
      const validDateStrings = [
        '2023-01-01',
        '2023-12-31T23:59:59.999Z',
        'January 1, 2023',
        '01/01/2023',
        '2023-01-01T00:00:00.000Z'
      ];

      validDateStrings.forEach(dateString => {
        const result = validator.validate(dateString);
        expect(result.success).toBe(true);
        expect(result.data).toBeInstanceOf(Date);
        expect(isNaN(result.data!.getTime())).toBe(false);
      });
    });

    it('should validate numeric timestamps', () => {
      const timestamp = Date.now();
      const result = validator.validate(timestamp);
      
      expect(result.success).toBe(true);
      expect(result.data).toBeInstanceOf(Date);
      expect(result.data!.getTime()).toBe(timestamp);
    });

    it('should validate zero timestamp', () => {
      const result = validator.validate(0);
      
      expect(result.success).toBe(true);
      expect(result.data).toBeInstanceOf(Date);
      expect(result.data!.getTime()).toBe(0);
    });
  });

  describe('validation failures', () => {
    it('should reject invalid date strings', () => {
      const invalidDateStrings = [
        'invalid-date',
        'not a date at all',
        'abcdefg',
        '32/32/2023',
        'hello world'
      ];

      invalidDateStrings.forEach(dateString => {
        const result = validator.validate(dateString);
        expect(result.success).toBe(false);
        expect(result.errors).toContain('Value must be a valid date');
      });
    });

    it('should reject non-date values', () => {
      const testCases = [null, undefined, true, false, {}, [], Symbol('test')];
      
      testCases.forEach(testCase => {
        const result = validator.validate(testCase);
        expect(result.success).toBe(false);
        expect(result.errors).toContain('Value must be a valid date');
        expect(result.data).toBeUndefined();
      });
    });

    it('should reject invalid Date objects', () => {
      const invalidDate = new Date('invalid');
      const result = validator.validate(invalidDate);
      
      expect(result.success).toBe(false);
      expect(result.errors).toContain('Value must be a valid date');
    });

    it('should reject NaN timestamps', () => {
      const result = validator.validate(NaN);
      
      expect(result.success).toBe(false);
      expect(result.errors).toContain('Value must be a valid date');
    });
  });

  describe('edge cases', () => {
    it('should handle leap years correctly', () => {
      const leapYearDate = '2020-02-29'; // 2020 is a leap year
      const result = validator.validate(leapYearDate);
      
      expect(result.success).toBe(true);
      expect(result.data!.getFullYear()).toBe(2020);
      expect(result.data!.getMonth()).toBe(1); // February (0-indexed)
      expect(result.data!.getDate()).toBe(29);
    });

    it('should handle various date formats', () => {
      const dateFormats = [
        { input: '2023-01-01', expected: new Date('2023-01-01') },
        { input: 1672531200000, expected: new Date(1672531200000) },
        { input: 'Dec 25, 2023', expected: new Date('Dec 25, 2023') }
      ];

      dateFormats.forEach(({ input, expected }) => {
        const result = validator.validate(input);
        expect(result.success).toBe(true);
        expect(result.data!.getTime()).toBe(expected.getTime());
      });
    });

    it('should handle very old dates', () => {
      const oldDate = new Date('1900-01-01');
      const result = validator.validate(oldDate);
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual(oldDate);
    });

    it('should handle very future dates', () => {
      const futureDate = new Date('2100-12-31');
      const result = validator.validate(futureDate);
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual(futureDate);
    });

    it('should handle timezone-aware dates', () => {
      const isoString = '2023-01-01T12:00:00.000Z';
      const result = validator.validate(isoString);
      
      expect(result.success).toBe(true);
      expect(result.data!.toISOString()).toBe(isoString);
    });
  });

  describe('custom messages', () => {
    it('should use custom message for validation', () => {
      const customValidator = validator.withMessage('Please enter a valid date');
      
      const result = customValidator.validate('invalid-date');
      expect(result.success).toBe(false);
      expect(result.errors).toEqual(['Please enter a valid date']);
    });

    it('should use custom message for invalid Date objects', () => {
      const customValidator = validator.withMessage('Date is not valid');
      
      const result = customValidator.validate(new Date('invalid'));
      expect(result.success).toBe(false);
      expect(result.errors).toEqual(['Date is not valid']);
    });

    it('should return same validator instance for chaining', () => {
      const chainedValidator = validator.withMessage('Custom message');
      expect(chainedValidator).toBe(validator);
    });
  });

  describe('optional validation', () => {
    it('should create optional validator', () => {
      const optionalValidator = validator.optional();
      
      expect(optionalValidator.validate(undefined).success).toBe(true);
      expect(optionalValidator.validate(null).success).toBe(true);
      expect(optionalValidator.validate(new Date()).success).toBe(true);
      expect(optionalValidator.validate('2023-01-01').success).toBe(true);
      expect(optionalValidator.validate('invalid-date').success).toBe(false);
    });

    it('should chain optional with custom message', () => {
      const optionalCustomValidator = validator
        .withMessage('Custom date message')
        .optional();
      
      expect(optionalCustomValidator.validate(undefined).success).toBe(true);
      expect(optionalCustomValidator.validate(new Date()).success).toBe(true);
      
      const result = optionalCustomValidator.validate('invalid');
      expect(result.success).toBe(false);
      expect(result.errors).toEqual(['Custom date message']);
    });
  });

  describe('data transformation', () => {
    it('should convert string to Date object', () => {
      const dateString = '2023-01-01';
      const result = validator.validate(dateString);
      
      expect(result.success).toBe(true);
      expect(result.data).toBeInstanceOf(Date);
      expect(result.data!.getFullYear()).toBe(2023);
    });

    it('should convert number to Date object', () => {
      const timestamp = 1672531200000; // 2023-01-01T00:00:00.000Z
      const result = validator.validate(timestamp);
      
      expect(result.success).toBe(true);
      expect(result.data).toBeInstanceOf(Date);
      expect(result.data!.getTime()).toBe(timestamp);
    });

    it('should preserve Date objects as-is', () => {
      const originalDate = new Date('2023-01-01');
      const result = validator.validate(originalDate);
      
      expect(result.success).toBe(true);
      expect(result.data).toBe(originalDate); // Same reference
    });
  });
}); 