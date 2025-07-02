import { BooleanValidator } from '../validators/boolean-validator';

describe('BooleanValidator', () => {
  let validator: BooleanValidator;

  beforeEach(() => {
    validator = new BooleanValidator();
  });

  describe('basic validation', () => {
    it('should validate true', () => {
      const result = validator.validate(true);
      expect(result.success).toBe(true);
      expect(result.data).toBe(true);
      expect(result.errors).toBeUndefined();
    });

    it('should validate false', () => {
      const result = validator.validate(false);
      expect(result.success).toBe(true);
      expect(result.data).toBe(false);
      expect(result.errors).toBeUndefined();
    });

    it('should reject non-boolean values', () => {
      const testCases = [1, 0, 'true', 'false', null, undefined, {}, [], NaN];
      
      testCases.forEach(testCase => {
        const result = validator.validate(testCase);
        expect(result.success).toBe(false);
        expect(result.errors).toContain('Value must be a boolean');
        expect(result.data).toBeUndefined();
      });
    });
  });

  describe('custom messages', () => {
    it('should use custom message for validation', () => {
      const customValidator = validator.withMessage('Please select yes or no');
      
      const result = customValidator.validate('yes');
      expect(result.success).toBe(false);
      expect(result.errors).toEqual(['Please select yes or no']);
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
      expect(optionalValidator.validate(true).success).toBe(true);
      expect(optionalValidator.validate(false).success).toBe(true);
      expect(optionalValidator.validate('not boolean').success).toBe(false);
    });

    it('should chain optional with custom message', () => {
      const optionalCustomValidator = validator
        .withMessage('Custom boolean message')
        .optional();
      
      expect(optionalCustomValidator.validate(undefined).success).toBe(true);
      expect(optionalCustomValidator.validate(true).success).toBe(true);
      
      const result = optionalCustomValidator.validate('invalid');
      expect(result.success).toBe(false);
      expect(result.errors).toEqual(['Custom boolean message']);
    });
  });

  describe('edge cases', () => {
    it('should handle Boolean object instances', () => {
      // Boolean objects are not primitive booleans
      const boolObj = new Boolean(true);
      const result = validator.validate(boolObj);
      expect(result.success).toBe(false);
      expect(result.errors).toContain('Value must be a boolean');
    });

    it('should handle truthy/falsy values correctly', () => {
      const truthyValues = [1, 'true', 'false', {}, []];
      const falsyValues = [0, '', null, undefined, NaN];
      
      [...truthyValues, ...falsyValues].forEach(value => {
        const result = validator.validate(value);
        expect(result.success).toBe(false);
        expect(result.errors).toContain('Value must be a boolean');
      });
    });
  });
}); 