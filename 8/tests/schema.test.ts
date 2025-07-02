import { Schema } from '../validators/schema';

describe('Schema Builder', () => {
  describe('factory methods', () => {
    it('should create StringValidator', () => {
      const validator = Schema.string();
      expect(validator.validate('test').success).toBe(true);
      expect(validator.validate(123).success).toBe(false);
    });

    it('should create NumberValidator', () => {
      const validator = Schema.number();
      expect(validator.validate(123).success).toBe(true);
      expect(validator.validate('123').success).toBe(false);
    });

    it('should create BooleanValidator', () => {
      const validator = Schema.boolean();
      expect(validator.validate(true).success).toBe(true);
      expect(validator.validate('true').success).toBe(false);
    });

    it('should create DateValidator', () => {
      const validator = Schema.date();
      expect(validator.validate(new Date()).success).toBe(true);
      expect(validator.validate('2023-01-01').success).toBe(true);
      expect(validator.validate('invalid-date').success).toBe(false);
    });

    it('should create ObjectValidator', () => {
      const validator = Schema.object({
        name: Schema.string()
      });
      expect(validator.validate({ name: 'John' }).success).toBe(true);
      expect(validator.validate('not an object').success).toBe(false);
    });

    it('should create ArrayValidator', () => {
      const validator = Schema.array(Schema.string());
      expect(validator.validate(['a', 'b', 'c']).success).toBe(true);
      expect(validator.validate(['a', 1, 'c']).success).toBe(false);
      expect(validator.validate('not an array').success).toBe(false);
    });
  });

  describe('complex schema creation', () => {
    it('should create user schema with nested address', () => {
      const addressSchema = Schema.object({
        street: Schema.string(),
        city: Schema.string(),
        postalCode: Schema.string().pattern(/^\d{5}$/)
      });

      const userSchema = Schema.object({
        id: Schema.string(),
        name: Schema.string().minLength(2).maxLength(50),
        email: Schema.string().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
        age: Schema.number().min(0).max(120).optional(),
        isActive: Schema.boolean(),
        tags: Schema.array(Schema.string()),
        address: addressSchema.optional()
      });

      const validUser = {
        id: '123',
        name: 'John Doe',
        email: 'john@example.com',
        age: 30,
        isActive: true,
        tags: ['developer', 'designer'],
        address: {
          street: '123 Main St',
          city: 'Anytown',
          postalCode: '12345'
        }
      };

      const result = userSchema.validate(validUser);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(validUser);
    });

    it('should validate array of objects', () => {
      const itemSchema = Schema.object({
        id: Schema.number(),
        name: Schema.string(),
        price: Schema.number().min(0)
      });

      const cartSchema = Schema.object({
        items: Schema.array(itemSchema),
        total: Schema.number().min(0)
      });

      const validCart = {
        items: [
          { id: 1, name: 'Apple', price: 1.5 },
          { id: 2, name: 'Banana', price: 0.8 }
        ],
        total: 2.3
      };

      const result = cartSchema.validate(validCart);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(validCart);
    });

    it('should handle deeply nested objects', () => {
      const deepSchema = Schema.object({
        level1: Schema.object({
          level2: Schema.object({
            level3: Schema.object({
              value: Schema.string()
            })
          })
        })
      });

      const validData = {
        level1: {
          level2: {
            level3: {
              value: 'deep value'
            }
          }
        }
      };

      expect(deepSchema.validate(validData).success).toBe(true);
    });
  });

  describe('validation error handling', () => {
    it('should collect all validation errors', () => {
      const schema = Schema.object({
        name: Schema.string().minLength(2),
        age: Schema.number().min(0),
        email: Schema.string().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
      });

      const invalidData = {
        name: 'J',
        age: -5,
        email: 'invalid-email'
      };

      const result = schema.validate(invalidData);
      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(3);
      expect(result.errors).toContain('name: Value must be at least 2 characters long');
      expect(result.errors).toContain('age: Value must be at least 0');
    });

    it('should handle array validation errors', () => {
      const schema = Schema.object({
        tags: Schema.array(Schema.string().minLength(2))
      });

      const invalidData = {
        tags: ['valid', 'a', 'also-valid', 'b']
      };

      const result = schema.validate(invalidData);
      expect(result.success).toBe(false);
      expect(result.errors).toContain('tags: [1]: Value must be at least 2 characters long');
      expect(result.errors).toContain('tags: [3]: Value must be at least 2 characters long');
    });
  });

  describe('optional fields', () => {
    it('should handle optional primitive fields', () => {
      const schema = Schema.object({
        required: Schema.string(),
        optional: Schema.string().optional()
      });

      const dataWithOptional = { required: 'test', optional: 'value' };
      expect(schema.validate(dataWithOptional).success).toBe(true);

      const dataWithoutOptional = { required: 'test' };
      expect(schema.validate(dataWithoutOptional).success).toBe(true);
    });

    it('should handle optional object fields', () => {
      const addressSchema = Schema.object({
        street: Schema.string(),
        city: Schema.string()
      });

      const schema = Schema.object({
        name: Schema.string(),
        address: addressSchema.optional()
      });

      const withAddress = {
        name: 'John',
        address: { street: '123 Main St', city: 'Anytown' }
      };
      expect(schema.validate(withAddress).success).toBe(true);

      const withoutAddress = { name: 'John' };
      expect(schema.validate(withoutAddress).success).toBe(true);
    });

    it('should handle optional array fields', () => {
      const schema = Schema.object({
        name: Schema.string(),
        tags: Schema.array(Schema.string()).optional()
      });

      const withTags = { name: 'John', tags: ['developer'] };
      expect(schema.validate(withTags).success).toBe(true);

      const withoutTags = { name: 'John' };
      expect(schema.validate(withoutTags).success).toBe(true);
    });
  });

  describe('real-world scenarios', () => {
    it('should validate API request payload', () => {
      const createUserSchema = Schema.object({
        name: Schema.string().minLength(1).maxLength(100),
        email: Schema.string().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
        password: Schema.string().minLength(8),
        age: Schema.number().min(13).max(120).optional(),
        preferences: Schema.object({
          newsletter: Schema.boolean(),
          theme: Schema.string().pattern(/^(light|dark)$/)
        }).optional()
      });

      const validPayload = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'securePassword123'
      };

      expect(createUserSchema.validate(validPayload).success).toBe(true);

      const invalidPayload = {
        name: '',
        email: 'invalid-email',
        password: '123'
      };

      const result = createUserSchema.validate(invalidPayload);
      expect(result.success).toBe(false);
      expect(result.errors?.length).toBeGreaterThan(0);
    });
  });
}); 