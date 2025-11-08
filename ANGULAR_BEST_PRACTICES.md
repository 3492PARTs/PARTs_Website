# Angular Best Practices and Architectural Guidelines

This document outlines the architectural decisions, best practices, and coding standards used in this Angular application.

## Table of Contents
1. [Project Structure](#project-structure)
2. [Naming Conventions](#naming-conventions)
3. [Code Organization](#code-organization)
4. [Import Patterns](#import-patterns)
5. [Component Guidelines](#component-guidelines)
6. [Service Guidelines](#service-guidelines)
7. [State Management](#state-management)
8. [Testing Strategy](#testing-strategy)
9. [Code Quality Tools](#code-quality-tools)

## Project Structure

### Domain-Driven Architecture
This application follows a domain/feature-based structure rather than a type-based structure:

```
src/app/
├── core/                    # Application-wide singleton services and utilities
│   ├── constants/          # Shared constants and enums
│   ├── services/           # Core services (API, cache, database, etc.)
│   ├── helpers/            # HTTP interceptors, app initializers
│   ├── models/             # Core models and interfaces
│   ├── classes/            # Utility classes
│   └── utils/              # Utility functions
├── shared/                  # Reusable components, pipes, and directives
│   ├── components/
│   │   ├── atoms/          # Basic UI components
│   │   ├── elements/       # Composite UI elements
│   │   └── navigation/     # Navigation components
│   ├── pipes/              # Data transformation pipes
│   └── directives/         # Custom directives
├── auth/                    # Authentication and authorization
├── admin/                   # Administration feature
├── scouting/               # Scouting feature
├── scouting-admin/         # Scouting administration feature
└── [other-features]/       # Other feature modules
```

### Benefits of This Structure
- **Better organization**: Related files grouped by feature/domain
- **Easier navigation**: Intuitive file location
- **Scalability**: New features are self-contained
- **Team collaboration**: Reduced merge conflicts
- **Code splitting**: Features can be lazy-loaded independently
- **Encapsulation**: Each domain has its own services, models, and components

## Naming Conventions

### Files
- **Components**: `feature-name.component.ts` (kebab-case)
- **Services**: `feature-name.service.ts` (kebab-case)
- **Models**: `feature-name.models.ts` (kebab-case)
- **Constants**: `feature-name.constants.ts` (kebab-case)
- **Pipes**: `feature-name.pipe.ts` (kebab-case)
- **Directives**: `feature-name.directive.ts` (kebab-case)
- **Guards**: `feature-name.guard.ts` (kebab-case)
- **Interceptors**: `feature-name.interceptor.ts` (kebab-case)

### Classes and Interfaces
- **Classes**: `PascalCase` (e.g., `UserService`, `LoginComponent`)
- **Interfaces**: `PascalCase` with `I` prefix (e.g., `IUser`, `IBanner`)
- **Enums**: `PascalCase` (e.g., `ApiStatus`, `AuthCallState`)

### Variables and Properties
- **Variables**: `camelCase` (e.g., `userName`, `isActive`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `DEFAULT_TIMEOUT`, `HTTP_STATUS`)
- **Component Inputs**: `camelCase` with `@Input()` decorator
- **Component Outputs**: `camelCase` with `@Output()` decorator
- **Private members**: Prefix with `_` if needed for clarity

### Selectors
- **Component selectors**: `app-feature-name` (kebab-case with app prefix)
- **Directive selectors**: `appFeatureName` (camelCase with app prefix)

## Code Organization

### Barrel Exports (index.ts)
Each feature module should have an `index.ts` file for cleaner imports:

```typescript
// auth/index.ts
export * from './services/auth.service';
export * from './models/user.models';
export * from './helpers/auth.guard';
```

This allows for cleaner imports:
```typescript
// Instead of:
import { AuthService } from './auth/services/auth.service';
import { User } from './auth/models/user.models';

// Use:
import { AuthService, User } from './auth';
```

### Feature Module Structure
Each feature module should follow this structure:
```
feature-name/
├── components/          # Feature-specific components
├── services/           # Feature-specific services (optional)
├── models/             # Feature-specific models (optional)
├── helpers/            # Feature-specific guards, resolvers (optional)
└── index.ts            # Barrel export
```

### Constants and Enums
- Keep constants in `core/constants/app.constants.ts`
- Use enums for related constants
- Use `as const` for read-only objects
- Export from barrel file for easy importing

## Import Patterns

### Import Order
1. Angular core imports
2. Third-party library imports
3. Application core imports
4. Shared imports
5. Feature imports
6. Relative imports

Example:
```typescript
import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs';

import { APIService, GeneralService } from '@app/core';
import { ButtonComponent, ModalComponent } from '@app/shared';
import { AuthService } from '@app/auth';

import { LocalModel } from './local.model';
```

### Path Aliases
Use TypeScript path aliases defined in `tsconfig.json`:
```typescript
"paths": {
  "@app/*": ["src/app/*"],
  "@scouting/*": ["src/app/scouting/*"],
  "@shared/*": ["src/app/shared/*"]
}
```

## Component Guidelines

### Component Structure
```typescript
@Component({
  selector: 'app-feature-name',
  imports: [CommonModule, SharedModule],
  templateUrl: './feature-name.component.html',
  styleUrls: ['./feature-name.component.scss']
})
export class FeatureNameComponent implements OnInit {
  // Public properties first
  @Input() data: string = '';
  @Output() dataChange = new EventEmitter<string>();
  
  // Then private properties
  private subscriptions: Subscription[] = [];
  
  constructor(
    private service: SomeService,
    private router: Router
  ) {}
  
  ngOnInit(): void {
    // Initialization logic
  }
  
  // Public methods
  public handleAction(): void {
    // Implementation
  }
  
  // Private methods
  private helperMethod(): void {
    // Implementation
  }
  
  ngOnDestroy(): void {
    // Cleanup subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
```

### Component Best Practices
- Use standalone components (Angular 14+)
- Keep components focused and single-responsibility
- Use `OnPush` change detection when possible
- Unsubscribe from observables in `ngOnDestroy`
- Use `async` pipe in templates when possible
- Keep template logic minimal
- Extract complex logic to services

## Service Guidelines

### Service Structure
```typescript
@Injectable({
  providedIn: 'root' // or specific module
})
export class FeatureService {
  private dataSubject = new BehaviorSubject<Data[]>([]);
  public data$ = this.dataSubject.asObservable();
  
  constructor(
    private http: HttpClient,
    private apiService: APIService
  ) {}
  
  public getData(): Observable<Data[]> {
    return this.http.get<Data[]>('/api/data');
  }
  
  private processData(data: Data[]): Data[] {
    // Processing logic
    return data;
  }
}
```

### Service Best Practices
- Use `providedIn: 'root'` for singleton services
- Expose observables as public, keep subjects private
- Use RxJS operators for data transformation
- Handle errors appropriately
- Use dependency injection
- Keep services focused on a single responsibility

## State Management

### Local State
- Use component properties for local state
- Use services with BehaviorSubjects for shared state
- Consider using signals (Angular 16+) for reactive state

### Global State
- Use core services for application-wide state
- Consider NgRx for complex state management
- Use IndexedDB (via Dexie) for offline-first capabilities

## Testing Strategy

### Unit Tests
- Test components, services, pipes, and directives
- Use Jasmine and Karma
- Aim for meaningful test coverage
- Test business logic thoroughly
- Mock dependencies appropriately

### Component Tests
```typescript
describe('FeatureComponent', () => {
  let component: FeatureComponent;
  let fixture: ComponentFixture<FeatureComponent>;
  
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeatureComponent],
      providers: [
        { provide: SomeService, useValue: mockService }
      ]
    }).compileComponents();
    
    fixture = TestBed.createComponent(FeatureComponent);
    component = fixture.componentInstance;
  });
  
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

## Code Quality Tools

### ESLint
- Configured with Angular-specific rules
- Enforces consistent code style
- Run with: `npm run lint`
- Auto-fix with: `npm run lint:fix`

### Prettier
- Consistent code formatting
- Integrated with ESLint
- Run with: `npm run format`
- Check formatting: `npm run format:check`

### TypeScript
- Strict mode enabled
- No implicit any
- Explicit function return types encouraged
- Use interfaces for object shapes

### Pre-commit Hooks (Recommended)
Consider adding Husky and lint-staged for automatic code quality checks:
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.ts": ["eslint --fix", "prettier --write"],
    "*.html": ["prettier --write"]
  }
}
```

## Additional Guidelines

### Performance
- Use lazy loading for feature modules
- Implement OnPush change detection
- Use trackBy in ngFor loops
- Optimize bundle size
- Use service workers for PWA capabilities

### Accessibility
- Use semantic HTML
- Provide ARIA labels when needed
- Ensure keyboard navigation
- Test with screen readers
- Follow WCAG guidelines

### Security
- Sanitize user inputs
- Use Angular's built-in XSS protection
- Validate on both client and server
- Use HTTPS in production
- Implement proper authentication/authorization

### Documentation
- Document complex logic
- Use JSDoc for public APIs
- Keep README up to date
- Document architectural decisions
- Provide code examples

## Migration Guide

When adding new features:
1. Create a new feature folder under `src/app/`
2. Add components, services, and models as needed
3. Create an `index.ts` barrel export
4. Update routing if needed
5. Add tests for new functionality
6. Update documentation

## Resources

- [Angular Style Guide](https://angular.dev/style-guide)
- [Angular Best Practices](https://angular.dev/best-practices)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [RxJS Documentation](https://rxjs.dev/)
