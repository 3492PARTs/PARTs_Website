# PARTsWebsite

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 18.2.3.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Docker Builds

This project uses a unified Dockerfile with build arguments for different environments. See [DOCKERFILE_USAGE.md](DOCKERFILE_USAGE.md) for detailed instructions.

### Quick Start

**Production build (Python runtime):**
```bash
docker build --build-arg BUILD_CONFIGURATION=production --target runtime-production -t parts-website:prod .
```

**UAT build (Nginx runtime):**
```bash
docker build --build-arg BUILD_CONFIGURATION=uat --target runtime-uat -t parts-website:uat .
```

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
