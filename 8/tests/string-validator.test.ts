import { StringValidator } from '../validators/string-validator';

describe('StringValidator', () => {
  let validator: StringValidator;

  beforeEach(() => {
    validator = new StringValidator();
  });

  describe('basic validation', () => {
    it('should validate valid strings', () => {
      const result = validator.validate('hello world');
      expect(result.success).toBe(true);
      expect(result.data).toBe('hello world');
      expect(result.errors).toBeUndefined();
    });

    it('should reject non-string values', () => {
      const testCases = [123, true, null, undefined, {}, []];
      
      testCases.forEach(testCase => {
        const result = validator.validate(testCase);
        expect(result.success).toBe(false);
        expect(result.errors).toContain('Value must be a string');
        expect(result.data).toBeUndefined();
      });
    });

    it('should validate empty strings', () => {
      const result = validator.validate('');
      expect(result.success).toBe(true);
      expect(result.data).toBe('');
    });
  });

  describe('pattern validation', () => {
    it('should validate strings matching pattern', () => {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const emailValidator = validator.pattern(emailPattern);
      
      const result = emailValidator.validate('test@example.com');
      expect(result.success).toBe(true);
      expect(result.data).toBe('test@example.com');
    });

    it('should reject strings not matching pattern', () => {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const emailValidator = validator.pattern(emailPattern);
      
      const result = emailValidator.validate('invalid-email');
      expect(result.success).toBe(false);
      expect(result.errors).toEqual([`Value must match pattern ${emailPattern}`]);
    });

    it('should use custom message for pattern validation', () => {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const emailValidator = validator.pattern(emailPattern).withMessage('Please enter a valid email');
      
      const result = emailValidator.validate('invalid-email');
      expect(result.success).toBe(false);
      expect(result.errors).toEqual(['Please enter a valid email']);
    });
  });

  describe('length validation', () => {
    it('should validate minimum length', () => {
      const minLengthValidator = validator.minLength(5);
      
      expect(minLengthValidator.validate('hello').success).toBe(true);
      expect(minLengthValidator.validate('hello world').success).toBe(true);
      
      const shortResult = minLengthValidator.validate('hi');
      expect(shortResult.success).toBe(false);
      expect(shortResult.errors).toContain('Value must be at least 5 characters long');
    });

    it('should validate maximum length', () => {
      const maxLengthValidator = validator.maxLength(10);
      
      expect(maxLengthValidator.validate('hello').success).toBe(true);
      expect(maxLengthValidator.validate('1234567890').success).toBe(true);
      
      const longResult = maxLengthValidator.validate('this is too long');
      expect(longResult.success).toBe(false);
      expect(longResult.errors).toContain('Value must be at most 10 characters long');
    });

    it('should validate both min and max length', () => {
      const lengthValidator = validator.minLength(3).maxLength(10);
      
      expect(lengthValidator.validate('hello').success).toBe(true);
      expect(lengthValidator.validate('hi').success).toBe(false);
      expect(lengthValidator.validate('this is too long').success).toBe(false);
    });
  });

  describe('method chaining', () => {
    it('should support chaining multiple validations', () => {
      const complexValidator = validator
        .minLength(3)
        .maxLength(20)
        .pattern(/^[a-zA-Z\s]+$/)
        .withMessage('Name must be 3-20 characters, letters only');
      
      expect(complexValidator.validate('John Doe').success).toBe(true);
      expect(complexValidator.validate('Jo').success).toBe(false);
      expect(complexValidator.validate('John123').success).toBe(false);
    });

    it('should return multiple errors for multiple failed validations', () => {
      const complexValidator = validator.minLength(5).maxLength(10);
      
      const result = complexValidator.validate('hi');
      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors).toContain('Value must be at least 5 characters long');
    });
  });

  describe('optional validation', () => {
    it('should create optional validator', () => {
      const optionalValidator = validator.optional();
      
      expect(optionalValidator.validate(undefined).success).toBe(true);
      expect(optionalValidator.validate(null).success).toBe(true);
      expect(optionalValidator.validate('hello').success).toBe(true);
      expect(optionalValidator.validate(123).success).toBe(false);
    });

    it('should chain optional with other validations', () => {
      const optionalEmailValidator = validator
        .pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
        .optional();
      
      expect(optionalEmailValidator.validate(undefined).success).toBe(true);
      expect(optionalEmailValidator.validate('test@example.com').success).toBe(true);
      expect(optionalEmailValidator.validate('invalid-email').success).toBe(false);
    });
  });

  describe('custom messages', () => {
    it('should use custom message for type validation', () => {
      const customValidator = validator.withMessage('Please provide a text value');
      
      const result = customValidator.validate(123);
      expect(result.success).toBe(false);
      expect(result.errors).toEqual(['Please provide a text value']);
    });

    it('should override custom message with pattern validation', () => {
      const customValidator = validator
        .pattern(/^\d+$/)
        .withMessage('Only numbers allowed');
      
      const result = customValidator.validate('abc');
      expect(result.success).toBe(false);
      expect(result.errors).toEqual(['Only numbers allowed']);
    });
  });
}); 