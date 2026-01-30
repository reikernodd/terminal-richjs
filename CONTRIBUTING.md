# Contributing to terminal-richjs

Thank you for your interest in contributing to terminal-richjs! This document provides guidelines and information for contributors.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/terminal-richjs.git
   cd terminal-richjs
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

### Building the Project

```bash
npm run build
```

This compiles TypeScript to JavaScript and generates type definitions.

### Running in Development Mode

```bash
npm run dev
```

This will watch for changes and rebuild automatically.

### Running Tests

```bash
npm test
```

For test coverage:

```bash
npm run test:coverage
```

### Code Quality

#### Linting

```bash
npm run lint
```

To automatically fix linting issues:

```bash
npm run lint:fix
```

#### Type Checking

```bash
npm run typecheck
```

#### Formatting

```bash
npm run format
```

## Code Style Guidelines

- Use **TypeScript** for all new code
- Follow the existing code style (enforced by ESLint and Prettier)
- Write clear, descriptive variable and function names
- Add JSDoc comments for public APIs
- Keep functions focused and concise

## Testing

- Write tests for new features and bug fixes
- Ensure all tests pass before submitting a PR
- Aim for good test coverage
- Test examples:

  ```typescript
  import { describe, it, expect } from 'vitest';
  import { Console } from '../src';

  describe('Console', () => {
    it('should create a console instance', () => {
      const console = new Console();
      expect(console).toBeDefined();
    });
  });
  ```

## Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` - A new feature
- `fix:` - A bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

Example:

```
feat: add support for custom box styles in panels
fix: resolve color parsing issue with hex codes
docs: update README with new examples
```

## Pull Request Process

1. **Update documentation** if you're changing functionality
2. **Add tests** for new features
3. **Ensure all tests pass** and code is linted
4. **Update the README.md** with details of changes if applicable
5. **Create a Pull Request** with a clear title and description
6. **Link any related issues** in the PR description

### Pull Request Checklist

- [ ] Code follows the project's style guidelines
- [ ] Tests have been added/updated
- [ ] All tests pass (`npm test`)
- [ ] Code lints without errors (`npm run lint`)
- [ ] TypeScript compiles without errors (`npm run typecheck`)
- [ ] Documentation has been updated
- [ ] Commit messages follow the conventional commits format

## Project Structure

```
terminal-richjs/
├── src/                    # Source code
│   ├── console/           # Console implementation
│   ├── core/              # Core utilities (markup, style, segment)
│   ├── renderables/       # Renderable components
│   ├── cli/               # CLI implementation
│   ├── syntax/            # Syntax highlighting
│   ├── markdown/          # Markdown rendering
│   ├── progress/          # Progress bars
│   ├── status/            # Spinners and status
│   ├── live/              # Live display
│   ├── traceback/         # Error tracebacks
│   └── index.ts           # Main exports
├── examples/              # Example scripts
├── dist/                  # Built files (generated)
└── tests/                 # Test files
```

## Adding New Features

When adding a new feature:

1. **Discuss first** - Open an issue to discuss major changes
2. **Follow existing patterns** - Look at similar features for consistency
3. **Export from index.ts** - Make new renderables/utilities available
4. **Add examples** - Include usage examples in `examples/`
5. **Document** - Update README.md with usage instructions

## Reporting Bugs

When reporting bugs, please include:

- **Description** - Clear description of the issue
- **Steps to reproduce** - Minimal code example
- **Expected behavior** - What you expected to happen
- **Actual behavior** - What actually happened
- **Environment**:
  - Node.js version
  - Operating system
  - Terminal emulator

## Feature Requests

We welcome feature requests! Please:

- Check if the feature already exists
- Search existing issues for similar requests
- Clearly describe the feature and its use case
- Provide examples of how it would be used

## Code of Conduct

### Our Standards

- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Accept responsibility for mistakes

### Unacceptable Behavior

- Harassment or discriminatory language
- Trolling or insulting comments
- Personal or political attacks
- Publishing others' private information

## Questions?

If you have questions:

- Check the [README.md](README.md) for documentation
- Look through [existing issues](https://github.com/YOUR_USERNAME/terminal-richjs/issues)
- Open a new issue with the `question` label

## License

By contributing to terminal-richjs, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to terminal-richjs! 🎉
