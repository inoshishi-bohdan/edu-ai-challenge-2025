import { ArrayValidator } from '../validators/array-validator';
import { StringValidator } from '../validators/string-validator';
import { NumberValidator } from '../validators/number-validator';
import { ObjectValidator } from '../validators/object-validator';

describe('ArrayValidator', () => {
  let stringValidator: StringValidator;
  let numberValidator: NumberValidator;

  beforeEach(() => {
    stringValidator = new StringValidator();
    numberValidator = new NumberValidator();
  });

  describe('basic validation', () => {
    it('should validate arrays of strings', () => {
      const validator = new ArrayValidator(stringValidator);
      
      const result = validator.validate(['hello', 'world', 'test']);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(['hello', 'world', 'test']);
      expect(result.errors).toBeUndefined();
    });

    it('should validate empty arrays', () => {
      const validator = new ArrayValidator(stringValidator);
      
      const result = validator.validate([]);
      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });

    it('should reject non-array values', () => {
      const validator = new ArrayValidator(stringValidator);
      const testCases = [null, undefined, 'string', 123, true, {}];
      
      testCases.forEach(testCase => {
        const result = validator.validate(testCase);
        expect(result.success).toBe(false);
        expect(result.errors).toContain('Value must be an array');
        expect(result.data).toBeUndefined();
      });
    });
  });

  describe('element validation', () => {
    it('should validate array of numbers', () => {
      const validator = new ArrayValidator(numberValidator);
      
      const validResult = validator.validate([1, 2, 3, 4.5]);
      expect(validResult.success).toBe(true);
      expect(validResult.data).toEqual([1, 2, 3, 4.5]);
      
      const invalidResult = validator.validate([1, 'not a number', 3]);
      expect(invalidResult.success).toBe(false);
      expect(invalidResult.errors).toContain('[1]: Value must be a number');
    });

    it('should collect multiple element errors', () => {
      const validator = new ArrayValidator(stringValidator);
      
      const result = validator.validate(['valid', 123, 'also valid', true, 'valid again']);
      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.errors).toContain('[1]: Value must be a string');
      expect(result.errors).toContain('[3]: Value must be a string');
    });

    it('should validate with complex element validators', () => {
      const emailValidator = new StringValidator().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
      const validator = new ArrayValidator(emailValidator);
      
      const validEmails = ['test@example.com', 'user@domain.org'];
      expect(validator.validate(validEmails).success).toBe(true);
      
      const mixedEmails = ['test@example.com', 'invalid-email', 'user@domain.org'];
      const result = validator.validate(mixedEmails);
      expect(result.success).toBe(false);
      expect(result.errors?.[0]).toMatch(/\[1\]: Value must match pattern/);
    });
  });

  describe('nested arrays', () => {
    it('should validate arrays of arrays', () => {
      const innerArrayValidator = new ArrayValidator(stringValidator);
      const nestedValidator = new ArrayValidator(innerArrayValidator);
      
      const validData = [['a', 'b'], ['c', 'd'], ['e']];
      const result = nestedValidator.validate(validData);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(validData);
      
      const invalidData = [['a', 'b'], ['c', 123], ['e']];
      const invalidResult = nestedValidator.validate(invalidData);
      expect(invalidResult.success).toBe(false);
      expect(invalidResult.errors?.[0]).toMatch(/\[1\]: \[1\]: Value must be a string/);
    });
  });

  describe('arrays of objects', () => {
    it('should validate arrays of objects', () => {
      const userSchema = new ObjectValidator({
        name: new StringValidator(),
        age: new NumberValidator()
      });
      const usersValidator = new ArrayValidator(userSchema);
      
      const validUsers = [
        { name: 'John', age: 25 },
        { name: 'Jane', age: 30 }
      ];
      
      const result = usersValidator.validate(validUsers);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(validUsers);
      
      const invalidUsers = [
        { name: 'John', age: 25 },
        { name: 'Jane', age: 'not a number' }
      ];
      
      const invalidResult = usersValidator.validate(invalidUsers);
      expect(result.success).toBe(true);
      expect(invalidResult.success).toBe(false);
      expect(invalidResult.errors?.[0]).toMatch(/\[1\]: age: Value must be a number/);
    });
  });

  describe('optional validation', () => {
    it('should create optional validator', () => {
      const validator = new ArrayValidator(stringValidator);
      const optionalValidator = validator.optional();
      
      expect(optionalValidator.validate(undefined).success).toBe(true);
      expect(optionalValidator.validate(null).success).toBe(true);
      expect(optionalValidator.validate(['valid', 'array']).success).toBe(true);
      expect(optionalValidator.validate('not an array').success).toBe(false);
    });

    it('should work with optional element validators', () => {
      const optionalStringValidator = stringValidator.optional();
      const validator = new ArrayValidator(optionalStringValidator);
      
      const result = validator.validate(['hello', undefined, 'world', null]);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(['hello', undefined, 'world', undefined]);
    });
  });

  describe('edge cases', () => {
    it('should handle arrays with mixed valid/invalid elements', () => {
      const minLengthValidator = new StringValidator().minLength(3);
      const validator = new ArrayValidator(minLengthValidator);
      
      const result = validator.validate(['valid', 'hi', 'also valid', 'no']);
      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.errors).toContain('[1]: Value must be at least 3 characters long');
      expect(result.errors).toContain('[3]: Value must be at least 3 characters long');
    });

    it('should handle large arrays efficiently', () => {
      const validator = new ArrayValidator(numberValidator);
      const largeArray = Array.from({ length: 1000 }, (_, i) => i);
      
      const result = validator.validate(largeArray);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(largeArray);
    });

    it('should preserve array order', () => {
      const validator = new ArrayValidator(stringValidator);
      const orderedArray = ['first', 'second', 'third'];
      
      const result = validator.validate(orderedArray);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(orderedArray);
    });
  });
}); 