# Type-Safe Validation Library

A powerful, modular, and type-safe validation library for TypeScript with a fluent API design. Built with comprehensive testing and production-ready reliability.

[![Tests](https://img.shields.io/badge/tests-103%20passing-green)]()
[![Coverage](https://img.shields.io/badge/coverage-88.02%25-brightgreen)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)]()

## 🚀 Features

- **🔒 Type-Safe** - Full TypeScript support with proper generic types
- **🔗 Fluent API** - Chainable method calls for readable schema definitions
- **📦 Modular Design** - Clean separation of concerns with individual validator files
- **⚡ Performance** - Optimized for large datasets and complex validations
- **🧪 Well-Tested** - 103 comprehensive tests with 88% coverage
- **🎯 Production Ready** - Zero dependencies, robust error handling

## 📋 Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [API Reference](#api-reference)
- [Examples](#examples)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [Development](#development)
- [Contributing](#contributing)

## 🛠 Installation

### Prerequisites
- Node.js 16+ 
- TypeScript 4.5+

### Setup
```bash
# Clone the repository
git clone <repository-url>
cd validation-library

# Install dependencies
npm install

# Run tests to verify installation
npm test
```

## ⚡ Quick Start

### Basic Usage

```typescript
import { Schema } from './validators/schema';

// Create a simple validator
const emailValidator = Schema.string()
  .pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
  .withMessage('Please enter a valid email');

// Validate data
const result = emailValidator.validate('user@example.com');

if (result.success) {
  console.log('Valid email:', result.data);
} else {
  console.log('Errors:', result.errors);
}
```

### Complex Schema Validation

```typescript
import { Schema } from './validators/schema';

// Define nested schema
const userSchema = Schema.object({
  id: Schema.string(),
  name: Schema.string().minLength(2).maxLength(50),
  email: Schema.string().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
  age: Schema.number().min(0).max(120).optional(),
  isActive: Schema.boolean(),
  tags: Schema.array(Schema.string()),
  address: Schema.object({
    street: Schema.string(),
    city: Schema.string(),
    postalCode: Schema.string().pattern(/^\d{5}$/)
  }).optional()
});

// Validate user data
const userData = {
  id: "12345",
  name: "John Doe",
  email: "john@example.com",
  isActive: true,
  tags: ["developer", "designer"]
};

const result = userSchema.validate(userData);
```

## 📚 API Reference

### Schema Factory Methods

```typescript
// Primitive validators
Schema.string()     // String validation
Schema.number()     // Number validation  
Schema.boolean()    // Boolean validation
Schema.date()       // Date validation

// Complex validators
Schema.object(schema)        // Object with nested validation
Schema.array(itemValidator)  // Array with element validation
```

### String Validator

```typescript
Schema.string()
  .minLength(min: number)           // Minimum length
  .maxLength(max: number)           // Maximum length
  .pattern(regex: RegExp)           // Pattern matching
  .withMessage(message: string)     // Custom error message
  .optional()                       // Make field optional
```

### Number Validator

```typescript
Schema.number()
  .min(min: number)                 // Minimum value
  .max(max: number)                 // Maximum value
  .withMessage(message: string)     // Custom error message
  .optional()                       // Make field optional
```

### Boolean Validator

```typescript
Schema.boolean()
  .withMessage(message: string)     // Custom error message
  .optional()                       // Make field optional
```

### Date Validator

```typescript
Schema.date()
  .withMessage(message: string)     // Custom error message
  .optional()                       // Make field optional
```

### Object Validator

```typescript
Schema.object({
  field1: validator1,
  field2: validator2,
  // ... more fields
})
  .optional()                       // Make entire object optional
```

### Array Validator

```typescript
Schema.array(itemValidator)
  .optional()                       // Make array optional
```

## 💡 Examples

### User Registration Form

```typescript
const registrationSchema = Schema.object({
  username: Schema.string()
    .minLength(3)
    .maxLength(20)
    .pattern(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username must be 3-20 characters, alphanumeric and underscore only'),
  
  email: Schema.string()
    .pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
    .withMessage('Please enter a valid email address'),
  
  password: Schema.string()
    .minLength(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least 8 characters with uppercase, lowercase, and number'),
  
  age: Schema.number()
    .min(13)
    .max(120)
    .optional(),
  
  preferences: Schema.object({
    newsletter: Schema.boolean(),
    theme: Schema.string().pattern(/^(light|dark)$/)
  }).optional()
});

// Validate registration data
const registrationData = {
  username: "john_doe",
  email: "john@example.com",
  password: "SecurePass123",
  age: 25
};

const result = registrationSchema.validate(registrationData);
```

### API Request Validation

```typescript
const apiRequestSchema = Schema.object({
  method: Schema.string().pattern(/^(GET|POST|PUT|DELETE)$/),
  url: Schema.string().minLength(1),
  headers: Schema.object({
    'Content-Type': Schema.string().optional(),
    'Authorization': Schema.string().optional()
  }).optional(),
  body: Schema.object({}).optional(),
  timeout: Schema.number().min(1000).max(30000).optional()
});
```

### E-commerce Product

```typescript
const productSchema = Schema.object({
  id: Schema.string(),
  name: Schema.string().minLength(1).maxLength(100),
  price: Schema.number().min(0),
  currency: Schema.string().pattern(/^[A-Z]{3}$/),
  inStock: Schema.boolean(),
  categories: Schema.array(Schema.string()),
  specifications: Schema.object({
    weight: Schema.number().min(0).optional(),
    dimensions: Schema.object({
      length: Schema.number().min(0),
      width: Schema.number().min(0),
      height: Schema.number().min(0)
    }).optional()
  }).optional()
});
```

## 🧪 Testing

### Run Tests

```bash
# Run all tests
npm test

# Run tests with coverage report
npm run test:coverage

# Run tests in watch mode (development)
npm run test:watch
```

### Test Coverage

Current test coverage: **88.02%**

```
File                    | % Stmts | % Branch | % Funcs | % Lines
------------------------|---------|----------|---------|--------
All files               |   88.02 |    96.61 |   78.57 |   93.12
validators/
  array-validator.ts    |     100 |    83.33 |     100 |     100
  boolean-validator.ts  |     100 |      100 |     100 |     100
  date-validator.ts     |     100 |      100 |     100 |     100
  number-validator.ts   |     100 |      100 |     100 |     100
  object-validator.ts   |     100 |    88.88 |     100 |     100
  optional-validator.ts |   83.33 |      100 |   66.66 |   83.33
  schema.ts             |     100 |      100 |     100 |     100
  string-validator.ts   |     100 |      100 |     100 |     100
```

### Test Structure

- **103 total tests** across 7 test files
- **Unit tests** for each validator type
- **Integration tests** for complex schemas
- **Edge case testing** for boundary conditions
- **Performance tests** for large datasets

## 📁 Project Structure

```
├── 📋 Core Library (Source Code)
│   ├── index.ts             # Main export file
│   └── validators/          # All validator source code
│       ├── types.ts              # Core interfaces and types
│       ├── optional-validator.ts # Optional field wrapper
│       ├── string-validator.ts   # String validation
│       ├── number-validator.ts   # Number validation
│       ├── boolean-validator.ts  # Boolean validation
│       ├── date-validator.ts     # Date validation
│       ├── object-validator.ts   # Object schema validation
│       ├── array-validator.ts    # Array validation
│       └── schema.ts            # Schema builder + examples
│
├── 🧪 Test Suite (103 Tests)
│   └── tests/               # All test files
│       ├── string-validator.test.ts
│       ├── number-validator.test.ts
│       ├── boolean-validator.test.ts
│       ├── date-validator.test.ts
│       ├── array-validator.test.ts
│       ├── object-validator.test.ts
│       └── schema.test.ts
│
└── ⚙️ Configuration & Documentation
    ├── package.json          # Dependencies and scripts
    ├── jest.config.js        # Jest test configuration
    ├── tsconfig.json         # TypeScript configuration
    ├── TEST_SUMMARY.md       # Comprehensive test documentation
    └── README.md            # This file
```

## 🔧 Development

### Available Scripts

```bash
# Run validation examples
npm start

# Development mode with file watching
npm run dev

# Build TypeScript to JavaScript
npm run build

# Run compiled JavaScript
npm run run

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Adding New Validators

1. Create new validator file in `validators/` directory
2. Implement the `Validator<T>` interface
3. Add factory method to `Schema` class
4. Create comprehensive test file in `tests/` directory
5. Update exports in `index.ts`

Example:
```typescript
// validators/custom-validator.ts
import { Validator, ValidationResult } from './types';

export class CustomValidator implements Validator<CustomType> {
  validate(value: unknown): ValidationResult<CustomType> {
    // Implementation
  }
  
  optional(): OptionalValidator<CustomType> {
    return new OptionalValidator(this);
  }
}
```

### Code Style

- **TypeScript** - Strict mode enabled
- **ESLint** - Code linting (if configured)
- **Prettier** - Code formatting (if configured)
- **Jest** - Testing framework
- **Conventional naming** - Clear, descriptive names

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Add tests** for your changes
4. **Ensure** all tests pass (`npm test`)
5. **Commit** your changes (`git commit -m 'Add amazing feature'`)
6. **Push** to the branch (`git push origin feature/amazing-feature`)
7. **Open** a Pull Request

### Contribution Guidelines

- ✅ Add comprehensive tests for new features
- ✅ Maintain or improve test coverage
- ✅ Follow existing code style and patterns
- ✅ Update documentation for API changes
- ✅ Ensure TypeScript types are properly defined

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

If you have questions or need help:

1. Check the [examples](#examples) section
2. Review the [API reference](#api-reference)
3. Look at the [test files](tests/) for usage patterns
4. Open an issue for bugs or feature requests

## 🎯 Roadmap

- [ ] Add more built-in validators (URL, UUID, etc.)
- [ ] Implement async validation support
- [ ] Add internationalization for error messages
- [ ] Create browser-compatible build
- [ ] Add performance benchmarks
- [ ] Create comprehensive documentation site

---

**Built with ❤️ and TypeScript** | **Production Ready** | **Zero Dependencies**
