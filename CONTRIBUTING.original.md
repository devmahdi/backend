# Contributing Guidelines

Thank you for contributing to this project! Please follow these guidelines to ensure smooth collaboration.

## Code of Conduct

- Be respectful and professional
- Provide constructive feedback
- Help each other succeed
- Report issues privately if needed

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone {your-fork-url}`
3. Add upstream: `git remote add upstream {original-repo-url}`
4. Create a branch: `git checkout -b feature/issue-number-description`
5. Install dependencies: `npm install`
6. Start development: `npm run dev`

## Commit Conventions

Follow Conventional Commits:
```
type(scope): subject

body (optional)

footer (optional)
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Code style (no logic change)
- `refactor` - Code refactoring
- `test` - Test changes
- `chore` - Build/tool changes
- `perf` - Performance improvement

## Pull Request Process

1. **Branch Creation**
   - Use descriptive names: `feature/123-user-authentication`
   - Branch from `develop` for new features
   - Branch from `main` for hotfixes

2. **Development**
   - Write clean, readable code
   - Add tests for new features
   - Document complex logic
   - Update relevant documentation

3. **Before Submitting**
   ```bash
   npm run lint      # Fix linting
   npm run format    # Auto-format code
   npm run test      # Run tests
   npm run build     # Verify build
   ```

4. **Submit PR**
   - Use the PR template
   - Link related issues
   - Describe changes clearly
   - Add screenshots/videos if UI changes

5. **Review Process**
   - Address feedback promptly
   - Request re-review after changes
   - Maintain conversation and respect

6. **Merge**
   - Keep commits clean
   - Use "Squash and merge" for minor changes
   - Delete branch after merge

## Code Style

### JavaScript/TypeScript
```typescript
// Use const/let, avoid var
const user = { name: "John" };

// Use arrow functions
const greet = (name: string) => `Hello, ${name}`;

// Add type annotations
interface User {
  id: string;
  email: string;
}

// Use meaningful names
const calculateUserScore = (user: User): number => {
  return user.reputation * user.trustFactor;
};
```

### Formatting
- Use Prettier (auto-configured)
- 2-space indentation
- Semicolons required
- Single quotes preferred

### Comments
```typescript
// Single-line comments for brief explanations

/**
 * Multi-line comments for functions/classes
 * @param {string} id - User ID
 * @returns {Promise<User>} User data
 */
const getUser = (id: string): Promise<User> => {
  // Implementation
};
```

## Testing Guidelines

### Test Structure
```typescript
describe("UserService", () => {
  describe("getUser", () => {
    it("should return user by ID", async () => {
      const user = await UserService.getUser("123");
      expect(user.id).toBe("123");
    });
  });
});
```

### Coverage Requirements
- Minimum 80% overall
- 100% for critical paths
- All public methods tested
- Edge cases covered

## Documentation

### README
- Clear setup instructions
- Project structure overview
- Common commands
- Troubleshooting section

### Code Comments
- Explain "why", not "what"
- Document complex algorithms
- Link to related issues/PRs
- Keep comments updated

### API Documentation
- Endpoint descriptions
- Request/response examples
- Error codes explained
- Rate limits documented

## Performance Considerations

- Profile before optimizing
- Monitor bundle size
- Lazy load when appropriate
- Cache intelligently
- Minimize dependencies

## Security Best Practices

- Never commit secrets
- Use environment variables
- Validate all inputs
- Sanitize outputs
- Follow OWASP guidelines
- Report vulnerabilities privately

## Git Workflow

### Keep Branch Updated
```bash
git fetch upstream
git rebase upstream/develop
```

### Before Pushing
```bash
# Check what changed
git diff

# Review commits
git log --oneline -5

# Push when ready
git push origin feature/123-description
```

### Squash If Needed
```bash
# Interactive rebase for last 3 commits
git rebase -i HEAD~3
```

## Review Checklist

Reviewers, check:
- [ ] Code follows style guidelines
- [ ] Tests are comprehensive
- [ ] No breaking changes (or justified)
- [ ] Documentation updated
- [ ] Performance impact acceptable
- [ ] Security concerns addressed
- [ ] Commit messages clear

## Questions?

- Check existing issues/discussions
- Review documentation
- Ask in PR comments
- Use GitHub Discussions
- Check Slack channel

## Recognition

Contributors are valued! Expect:
- Acknowledgment in release notes
- Potential addition to contributors list
- Invitations to upcoming features

Thank you for improving this project! 🚀

