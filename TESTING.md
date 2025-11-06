# Testing Guide for PARTs Website

This document explains how to run tests and generate coverage reports for the PARTs Website Angular application.

## Table of Contents
- [Running Tests](#running-tests)
- [Test Coverage](#test-coverage)
- [Writing Tests](#writing-tests)
- [CI/CD Integration](#cicd-integration)
- [Test Helpers](#test-helpers)

## Running Tests

### Interactive Mode (Development)
To run tests in interactive mode with a browser (useful during development):

```bash
npm test
```

This will:
- Open a Chrome browser with the Jasmine test runner
- Watch for file changes and re-run tests automatically
- Display test results in both the console and browser

### Headless Mode (CI)
To run tests in headless mode (for CI or quick validation):

```bash
npm run test:ci
```

This will:
- Run tests in ChromeHeadless browser
- Run tests only once (no watch mode)
- Generate code coverage reports
- Exit after all tests complete

## Test Coverage

### Generating Coverage Reports
To generate code coverage reports:

```bash
npm run test:coverage
```

Coverage reports will be generated in the `coverage/parts-website` directory:
- `index.html` - Interactive HTML coverage report
- `lcov.info` - LCOV format for CI tools
- Console output showing coverage summary

### Coverage Thresholds
This project enforces 100% code coverage across all metrics:
- **Statements:** 100%
- **Branches:** 100%
- **Functions:** 100%
- **Lines:** 100%

Tests will fail if coverage falls below these thresholds.

### Viewing Coverage Reports
After generating coverage:

```bash
open coverage/parts-website/index.html  # macOS
# or
xdg-open coverage/parts-website/index.html  # Linux
# or
start coverage/parts-website/index.html  # Windows
```

## Writing Tests

### Test File Organization
- Test files should be co-located with the source files they test
- Test files should have the `.spec.ts` extension
- Example: `component.ts` → `component.spec.ts`

### Component Tests
```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MyComponent } from './my.component';

describe('MyComponent', () => {
  let component: MyComponent;
  let fixture: ComponentFixture<MyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyComponent]  // Use imports for standalone components
    }).compileComponents();

    fixture = TestBed.createComponent(MyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

### Service Tests
```typescript
import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { MyService } from './my.service';

describe('MyService', () => {
  let service: MyService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MyService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(MyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
```

### Pipe Tests
```typescript
import { MyPipe } from './my.pipe';

describe('MyPipe', () => {
  let pipe: MyPipe;

  beforeEach(() => {
    pipe = new MyPipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should transform value', () => {
    expect(pipe.transform('input')).toBe('expected output');
  });
});
```

### Directive Tests
```typescript
import { ElementRef } from '@angular/core';
import { MyDirective } from './my.directive';

describe('MyDirective', () => {
  it('should create an instance', () => {
    const mockElementRef = new ElementRef(document.createElement('div'));
    const directive = new MyDirective(mockElementRef);
    expect(directive).toBeTruthy();
  });
});
```

### Guard Tests
```typescript
import { TestBed } from '@angular/core/testing';
import { myGuard } from './my.guard';

describe('myGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        // Add your service providers here
      ]
    });
  });

  it('should allow activation', (done) => {
    TestBed.runInInjectionContext(() => {
      const result = myGuard({} as any, {} as any);
      // Handle observable or promise result
      if (result instanceof Promise) {
        result.then(allowed => {
          expect(allowed).toBe(true);
          done();
        });
      } else {
        result.subscribe(allowed => {
          expect(allowed).toBe(true);
          done();
        });
      }
    });
  });
});
```

## Test Helpers

The project includes test helper utilities in `src/test-helpers.ts` to simplify test writing:

```typescript
import {
  createMockRouter,
  createMockActivatedRoute,
  createMockAPIService,
  createMockAuthService,
  getCommonTestProviders
} from '../test-helpers';

// Use in tests
const mockRouter = createMockRouter();
const mockRoute = createMockActivatedRoute({ id: '123' });
const mockAPIService = createMockAPIService();
```

## CI/CD Integration

### GitHub Actions
Add this to your workflow:

```yaml
- name: Run tests
  run: npm run test:ci

- name: Upload coverage reports
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/parts-website/lcov.info
```

### Jenkins
```groovy
stage('Test') {
  steps {
    sh 'npm run test:ci'
  }
}

stage('Coverage') {
  steps {
    publishHTML([
      reportDir: 'coverage/parts-website',
      reportFiles: 'index.html',
      reportName: 'Coverage Report'
    ])
  }
}
```

## Best Practices

1. **Test Behavior, Not Implementation**
   - Focus on testing what the code does, not how it does it
   - Test public APIs and observable behaviors

2. **Use Meaningful Test Descriptions**
   - Use descriptive `it()` statements
   - Follow the pattern: "should [expected behavior] when [condition]"

3. **Keep Tests Independent**
   - Each test should be able to run independently
   - Use `beforeEach()` for setup
   - Avoid test interdependencies

4. **Mock External Dependencies**
   - Mock HTTP calls, services, and external dependencies
   - Use test helpers for common mocks

5. **Test Edge Cases**
   - Test null/undefined inputs
   - Test boundary conditions
   - Test error scenarios

6. **Keep Tests Fast**
   - Avoid real HTTP calls
   - Minimize DOM manipulation
   - Use shallow rendering when possible

## Troubleshooting

### Tests Not Running
- Ensure all dependencies are installed: `npm install`
- Check that Chrome/Chromium is installed
- Try clearing cache: `rm -rf node_modules .angular && npm install`

### Coverage Not Generated
- Ensure `--code-coverage` flag is used
- Check karma.conf.js configuration
- Verify coverageReporter settings

### Tests Failing in CI but Passing Locally
- Ensure ChromeHeadless is used in CI
- Check for timing issues (use `async/await` or `fakeAsync`)
- Verify environment-specific dependencies

## Additional Resources

- [Angular Testing Guide](https://angular.dev/guide/testing)
- [Jasmine Documentation](https://jasmine.github.io/)
- [Karma Documentation](https://karma-runner.github.io/)
