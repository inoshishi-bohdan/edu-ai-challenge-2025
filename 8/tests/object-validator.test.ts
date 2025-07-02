import { ObjectValidator } from '../validators/object-validator';
import { StringValidator } from '../validators/string-validator';
import { NumberValidator } from '../validators/number-validator';
import { BooleanValidator } from '../validators/boolean-validator';

describe('ObjectValidator', () => {
  let stringValidator: StringValidator;
  let numberValidator: NumberValidator;
  let booleanValidator: BooleanValidator;

  beforeEach(() => {
    stringValidator = new StringValidator();
    numberValidator = new NumberValidator();
    booleanValidator = new BooleanValidator();
  });

  describe('basic validation', () => {
    it('should validate valid objects', () => {
      const schema = {
        name: stringValidator,
        age: numberValidator,
        isActive: booleanValidator
      };
      const validator = new ObjectValidator(schema);

      const testData = {
        name: 'John Doe',
        age: 25,
        isActive: true
      };

      const result = validator.validate(testData);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(testData);
      expect(result.errors).toBeUndefined();
    });

    it('should reject non-object values', () => {
      const schema = { name: stringValidator };
      const validator = new ObjectValidator(schema);

      const testCases = [null, undefined, 'string', 123, true, []];
      
      testCases.forEach(testCase => {
        const result = validator.validate(testCase);
        expect(result.success).toBe(false);
        expect(result.errors).toContain('Value must be an object');
      });
    });

    it('should reject arrays', () => {
      const schema = { name: stringValidator };
      const validator = new ObjectValidator(schema);

      const result = validator.validate(['item1', 'item2']);
      expect(result.success).toBe(false);
      expect(result.errors).toContain('Value must be an object');
    });
  });

  describe('field validation', () => {
    it('should validate individual fields', () => {
      const schema = {
        name: stringValidator.minLength(2),
        age: numberValidator.min(0).max(120)
      };
      const validator = new ObjectValidator(schema);

      const validData = { name: 'John', age: 25 };
      expect(validator.validate(validData).success).toBe(true);

      const invalidName = { name: 'J', age: 25 };
      const nameResult = validator.validate(invalidName);
      expect(nameResult.success).toBe(false);
      expect(nameResult.errors).toContain('name: Value must be at least 2 characters long');

      const invalidAge = { name: 'John', age: 150 };
      const ageResult = validator.validate(invalidAge);
      expect(ageResult.success).toBe(false);
      expect(ageResult.errors).toContain('age: Value must be at most 120');
    });

    it('should collect multiple field errors', () => {
      const schema = {
        name: stringValidator.minLength(2),
        age: numberValidator.min(0),
        email: stringValidator.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
      };
      const validator = new ObjectValidator(schema);

      const invalidData = {
        name: 'J',
        age: -5,
        email: 'invalid-email'
      };

      const result = validator.validate(invalidData);
      expect(result.success).toBe(false);
      expect(result.errors?.length).toBeGreaterThanOrEqual(3);
      expect(result.errors).toContain('name: Value must be at least 2 characters long');
      expect(result.errors).toContain('age: Value must be at least 0');
      expect(result.errors?.some(error => error.includes('email:'))).toBe(true);
    });

    it('should handle missing fields', () => {
      const schema = {
        name: stringValidator,
        age: numberValidator
      };
      const validator = new ObjectValidator(schema);

      const incompleteData = { name: 'John' };
      const result = validator.validate(incompleteData);
      expect(result.success).toBe(false);
      expect(result.errors).toContain('age: Value must be a number');
    });
  });

  describe('nested objects', () => {
    it('should validate nested object schemas', () => {
      const addressSchema = new ObjectValidator({
        street: new StringValidator(),
        city: new StringValidator(),
        postalCode: new StringValidator().pattern(/^\d{5}$/)
      });

      const userSchema = new ObjectValidator({
        name: new StringValidator(),
        address: addressSchema
      });

      const validData = {
        name: 'John Doe',
        address: {
          street: '123 Main St',
          city: 'Anytown',
          postalCode: '12345'
        }
      };

      const result = userSchema.validate(validData);
      if (!result.success) {
        console.log('Validation errors:', result.errors);
      }
      expect(result.success).toBe(true);
      expect(result.data).toEqual(validData);
    });

    it('should handle nested validation errors', () => {
      const addressSchema = new ObjectValidator({
        street: new StringValidator(),
        postalCode: new StringValidator().pattern(/^\d{5}$/)
      });

      const userSchema = new ObjectValidator({
        name: new StringValidator(),
        address: addressSchema
      });

      const invalidData = {
        name: 'John Doe',
        address: {
          street: '123 Main St',
          postalCode: 'invalid'
        }
      };

      const result = userSchema.validate(invalidData);
      expect(result.success).toBe(false);
      expect(result.errors?.some(error => 
        error.includes('address:') && error.includes('postalCode:')
      )).toBe(true);
    });
  });

  describe('optional validation', () => {
    it('should create optional validator', () => {
      const schema = { name: stringValidator };
      const validator = new ObjectValidator(schema);
      const optionalValidator = validator.optional();

      expect(optionalValidator.validate(undefined).success).toBe(true);
      expect(optionalValidator.validate(null).success).toBe(true);
      expect(optionalValidator.validate({ name: 'John' }).success).toBe(true);
      expect(optionalValidator.validate('not an object').success).toBe(false);
    });

    it('should work with optional fields inside schema', () => {
      const schema = {
        name: stringValidator,
        age: numberValidator.optional()
      };
      const validator = new ObjectValidator(schema);

      const dataWithAge = { name: 'John', age: 25 };
      expect(validator.validate(dataWithAge).success).toBe(true);

      const dataWithoutAge = { name: 'John' };
      expect(validator.validate(dataWithoutAge).success).toBe(true);

      const dataWithInvalidAge = { name: 'John', age: 'not a number' };
      expect(validator.validate(dataWithInvalidAge).success).toBe(false);
    });
  });

  describe('empty schema', () => {
    it('should handle empty schema', () => {
      const validator = new ObjectValidator({});
      
      const result = validator.validate({});
      expect(result.success).toBe(true);
      expect(result.data).toEqual({});
    });

    it('should ignore extra fields with empty schema', () => {
      const validator = new ObjectValidator({});
      
      const result = validator.validate({ extra: 'field' });
      expect(result.success).toBe(true);
      expect(result.data).toEqual({});
    });
  });

  describe('complex scenarios', () => {
    it('should handle deep nesting', () => {
      const deepSchema = new ObjectValidator({
        level1: new ObjectValidator({
          level2: new ObjectValidator({
            level3: stringValidator
          })
        })
      });

      const validData = {
        level1: {
          level2: {
            level3: 'deep value'
          }
        }
      };

      expect(deepSchema.validate(validData).success).toBe(true);

      const invalidData = {
        level1: {
          level2: {
            level3: 123
          }
        }
      };

      const result = deepSchema.validate(invalidData);
      expect(result.success).toBe(false);
      expect(result.errors?.[0]).toMatch(/level1: level2: level3: Value must be a string/);
    });
  });
}); 