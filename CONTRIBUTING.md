# Contributing Guidelines

Thank you for contributing to the PARTs Website project! This document provides guidelines and best practices for contributing to the codebase.

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Run the development server: `npm start`
4. Make your changes
5. Test your changes: `npm test`
6. Lint your code: `npm run lint`
7. Format your code: `npm run format`
8. Submit a pull request

## Code Standards

### Style Guide
We follow the [Angular Style Guide](https://angular.dev/style-guide). Please familiarize yourself with it.

### Code Quality Tools

Before submitting a pull request, ensure your code passes all checks:

```bash
# Run linter
npm run lint

# Fix linting issues automatically
npm run lint:fix

# Check code formatting
npm run format:check

# Format code automatically
npm run format

# Run tests
npm test
```

### TypeScript

- Use TypeScript strict mode
- Avoid using `any` type when possible
- Provide type annotations for function parameters and return values
- Use interfaces for object shapes

### Naming Conventions

- **Files**: kebab-case (e.g., `user-profile.component.ts`)
- **Classes**: PascalCase (e.g., `UserProfileComponent`)
- **Variables**: camelCase (e.g., `userName`, `isActive`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `DEFAULT_TIMEOUT`)
- **Interfaces**: PascalCase with `I` prefix (e.g., `IUser`)

### Project Structure

Follow the domain-driven architecture. Place new code in the appropriate feature module:

```
src/app/
├── core/           # Application-wide services and utilities
├── shared/         # Reusable components, pipes, directives
├── auth/           # Authentication
├── [feature]/      # Feature-specific code
```

See [ANGULAR_BEST_PRACTICES.md](ANGULAR_BEST_PRACTICES.md) and [DOMAIN_STRUCTURE.md](DOMAIN_STRUCTURE.md) for details.

## Adding New Features

### 1. Plan Your Feature
- Identify which domain it belongs to
- Check if similar functionality exists
- Consider reusability and maintainability

### 2. Create Feature Structure
```bash
# Create a new feature module
ng generate component features/my-feature

# Or create manually:
mkdir -p src/app/my-feature/{components,services,models}
```

### 3. Add Barrel Exports
Create `index.ts` in your feature module:
```typescript
// my-feature/index.ts
export * from './services/my-feature.service';
export * from './models/my-feature.models';
```

### 4. Write Tests
- Write unit tests for all new code
- Ensure tests pass: `npm test`
- Aim for meaningful test coverage

### 5. Update Documentation
- Add JSDoc comments for public APIs
- Update README if adding new scripts or features
- Document complex logic

## Component Guidelines

### Component Structure
```typescript
@Component({
  selector: 'app-my-component',
  imports: [CommonModule],
  templateUrl: './my-component.component.html',
  styleUrls: ['./my-component.component.scss']
})
export class MyComponentComponent implements OnInit {
  // Public properties
  @Input() data: string = '';
  @Output() dataChange = new EventEmitter<string>();
  
  // Private properties
  private subscription?: Subscription;
  
  constructor(private service: MyService) {}
  
  ngOnInit(): void {
    // Initialize
  }
  
  ngOnDestroy(): void {
    // Cleanup
    this.subscription?.unsubscribe();
  }
}
```

### Best Practices
- Use standalone components
- Keep components focused (single responsibility)
- Use `OnPush` change detection when possible
- Unsubscribe from observables
- Use `async` pipe in templates
- Keep template logic minimal

## Service Guidelines

### Service Structure
```typescript
@Injectable({
  providedIn: 'root'
})
export class MyService {
  private dataSubject = new BehaviorSubject<Data[]>([]);
  public data$ = this.dataSubject.asObservable();
  
  constructor(private http: HttpClient) {}
  
  public getData(): Observable<Data[]> {
    return this.http.get<Data[]>('/api/data');
  }
}
```

### Best Practices
- Use `providedIn: 'root'` for singletons
- Expose observables, keep subjects private
- Use RxJS operators for transformations
- Handle errors appropriately
- Add proper typing

## Git Workflow

### Branch Naming
- `feature/description` - New features
- `fix/description` - Bug fixes
- `refactor/description` - Code refactoring
- `docs/description` - Documentation updates

### Commit Messages
Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting, missing semicolons, etc.
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

Examples:
```
feat(auth): add remember me functionality

fix(scouting): resolve pit scouting form validation issue

docs(readme): update installation instructions
```

### Pull Request Process

1. **Update your branch** with the latest main branch
2. **Run all checks**: lint, format, test
3. **Write a clear PR description**:
   - What changes were made
   - Why the changes were necessary
   - How to test the changes
4. **Link related issues**
5. **Request review** from team members
6. **Address feedback** promptly
7. **Squash commits** if requested

### PR Title Format
```
<type>(<scope>): <description>
```

Example:
```
feat(scouting): add field scouting export functionality
```

## Testing

### Unit Tests
- Test all business logic
- Test component behavior
- Mock dependencies
- Use descriptive test names

### Test Structure
```typescript
describe('MyComponent', () => {
  let component: MyComponent;
  let fixture: ComponentFixture<MyComponent>;
  
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyComponent],
      providers: [
        { provide: MyService, useValue: mockService }
      ]
    }).compileComponents();
  });
  
  it('should create', () => {
    expect(component).toBeTruthy();
  });
  
  it('should do something specific', () => {
    // Arrange
    component.data = 'test';
    
    // Act
    component.doSomething();
    
    // Assert
    expect(component.result).toBe('expected');
  });
});
```

## Code Review

When reviewing code:
- Check for adherence to style guide
- Verify tests are present and meaningful
- Look for potential bugs or edge cases
- Suggest improvements for clarity
- Verify documentation is updated
- Be constructive and respectful

## Questions?

If you have questions about contributing:
- Check existing documentation
- Ask in team communication channels
- Open an issue for clarification
- Reach out to maintainers

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.
