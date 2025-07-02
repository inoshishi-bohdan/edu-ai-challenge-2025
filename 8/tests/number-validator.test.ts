import { NumberValidator } from '../validators/number-validator';

describe('NumberValidator', () => {
  let validator: NumberValidator;

  beforeEach(() => {
    validator = new NumberValidator();
  });

  describe('basic validation', () => {
    it('should validate valid numbers', () => {
      const testCases = [0, 1, -1, 1.5, -1.5, 100, 0.1];
      
      testCases.forEach(testCase => {
        const result = validator.validate(testCase);
        expect(result.success).toBe(true);
        expect(result.data).toBe(testCase);
        expect(result.errors).toBeUndefined();
      });
    });

    it('should reject non-number values', () => {
      const testCases = ['123', true, null, undefined, {}, []];
      
      testCases.forEach(testCase => {
        const result = validator.validate(testCase);
        expect(result.success).toBe(false);
        expect(result.errors).toContain('Value must be a number');
        expect(result.data).toBeUndefined();
      });
    });

    it('should reject NaN values', () => {
      const result = validator.validate(NaN);
      expect(result.success).toBe(false);
      expect(result.errors).toContain('Value must be a number');
    });

    it('should accept Infinity values', () => {
      const result = validator.validate(Infinity);
      expect(result.success).toBe(true);
      expect(result.data).toBe(Infinity);
    });
  });

  describe('range validation', () => {
    it('should validate minimum value', () => {
      const minValidator = validator.min(10);
      
      expect(minValidator.validate(10).success).toBe(true);
      expect(minValidator.validate(15).success).toBe(true);
      
      const result = minValidator.validate(5);
      expect(result.success).toBe(false);
      expect(result.errors).toContain('Value must be at least 10');
    });

    it('should validate maximum value', () => {
      const maxValidator = validator.max(100);
      
      expect(maxValidator.validate(100).success).toBe(true);
      expect(maxValidator.validate(50).success).toBe(true);
      
      const result = maxValidator.validate(150);
      expect(result.success).toBe(false);
      expect(result.errors).toContain('Value must be at most 100');
    });

    it('should validate range (min and max)', () => {
      const rangeValidator = validator.min(10).max(100);
      
      expect(rangeValidator.validate(50).success).toBe(true);
      expect(rangeValidator.validate(10).success).toBe(true);
      expect(rangeValidator.validate(100).success).toBe(true);
      
      expect(rangeValidator.validate(5).success).toBe(false);
      expect(rangeValidator.validate(150).success).toBe(false);
    });

    it('should handle decimal values in range', () => {
      const rangeValidator = validator.min(1.5).max(10.5);
      
      expect(rangeValidator.validate(1.5).success).toBe(true);
      expect(rangeValidator.validate(5.75).success).toBe(true);
      expect(rangeValidator.validate(10.5).success).toBe(true);
      
      expect(rangeValidator.validate(1.4).success).toBe(false);
      expect(rangeValidator.validate(10.6).success).toBe(false);
    });
  });

  describe('method chaining', () => {
    it('should support chaining min and max', () => {
      const ageValidator = validator.min(0).max(120);
      
      expect(ageValidator.validate(25).success).toBe(true);
      expect(ageValidator.validate(-1).success).toBe(false);
      expect(ageValidator.validate(121).success).toBe(false);
    });

    it('should support chaining with custom message', () => {
      const percentValidator = validator
        .min(0)
        .max(100)
        .withMessage('Percentage must be between 0 and 100');
      
      const result = percentValidator.validate(150);
      expect(result.success).toBe(false);
      expect(result.errors).toEqual(['Value must be at most 100']);
    });
  });

  describe('optional validation', () => {
    it('should create optional validator', () => {
      const optionalValidator = validator.optional();
      
      expect(optionalValidator.validate(undefined).success).toBe(true);
      expect(optionalValidator.validate(null).success).toBe(true);
      expect(optionalValidator.validate(42).success).toBe(true);
      expect(optionalValidator.validate('not a number').success).toBe(false);
    });

    it('should chain optional with range validation', () => {
      const optionalAgeValidator = validator.min(0).max(120).optional();
      
      expect(optionalAgeValidator.validate(undefined).success).toBe(true);
      expect(optionalAgeValidator.validate(25).success).toBe(true);
      expect(optionalAgeValidator.validate(-1).success).toBe(false);
    });
  });

  describe('custom messages', () => {
    it('should use custom message for type validation', () => {
      const customValidator = validator.withMessage('Please enter a valid number');
      
      const result = customValidator.validate('not a number');
      expect(result.success).toBe(false);
      expect(result.errors).toEqual(['Please enter a valid number']);
    });

    it('should use custom message for range validation', () => {
      const customValidator = validator.min(18).withMessage('Age must be at least 18');
      
      const result = customValidator.validate(16);
      expect(result.success).toBe(false);
      expect(result.errors).toEqual(['Value must be at least 18']);
    });
  });

  describe('edge cases', () => {
    it('should handle zero values', () => {
      expect(validator.validate(0).success).toBe(true);
      expect(validator.validate(-0).success).toBe(true);
    });

    it('should handle very large numbers', () => {
      const largeNumber = Number.MAX_SAFE_INTEGER;
      expect(validator.validate(largeNumber).success).toBe(true);
    });

    it('should handle very small numbers', () => {
      const smallNumber = Number.MIN_SAFE_INTEGER;
      expect(validator.validate(smallNumber).success).toBe(true);
    });
  });
}); 