# Angular App Domain-Based Structure

## Overview
This document describes the reorganization of the Angular application from a type-based structure to a domain/feature-based structure.

## Previous Structure (Type-Based)
```
src/app/
├── components/
│   ├── atoms/          # Reusable UI components
│   ├── elements/       # Composite UI elements
│   ├── navigation/     # Navigation components
│   └── webpages/       # Feature pages
├── services/           # All services
├── models/             # All models
├── helpers/            # Guards, interceptors, initializers
├── classes/            # Utility classes
├── pipes/              # Data transformation pipes
└── directives/         # Custom directives
```

## New Structure (Domain-Based)
```
src/app/
├── core/               # App-wide infrastructure
│   ├── services/       # Core services (API, cache, database, etc.)
│   ├── helpers/        # HTTP interceptor, app initializer
│   ├── models/         # Core models (API, navigation, form, etc.)
│   └── classes/        # Utility classes
├── shared/             # Reusable components, pipes, directives
│   ├── components/
│   │   ├── atoms/      # Basic UI components
│   │   ├── elements/   # Composite UI elements
│   │   └── navigation/ # Navigation components
│   ├── pipes/          # Data transformation pipes
│   └── directives/     # Custom directives
├── auth/               # Authentication & authorization
│   ├── components/
│   │   └── login/
│   ├── services/       # Auth service
│   ├── helpers/        # Auth guard
│   └── models/         # User models
├── public/             # Public-facing pages
│   └── components/     # home, about, contact, first, resources, event-competition
├── media/              # Media galleries
│   └── components/     # media, build-season, competition, community-outreach, wallpapers
├── recruitment/        # Team joining/recruitment
│   └── components/     # join, electrical, impact, mechanical, programming, team-application
├── sponsoring/         # Sponsorship
│   └── components/     # sponsoring, sponsor-shop
├── scouting/           # Scouting functionality
│   ├── components/     # field-scouting, pit-scouting, responses, strategizing
│   ├── services/       # Scouting service
│   └── models/         # Scouting models
├── scouting-admin/     # Scouting administration
│   └── components/     # All scouting admin pages
├── admin/              # General administration
│   └── components/     # admin-users, meetings, error-log, etc.
├── user/               # User profile
│   ├── components/     # profile
│   └── services/       # User service
├── attendance/         # Meeting attendance
│   ├── components/     # attendance
│   └── models/         # Attendance models
└── calendar/           # Event calendar
    └── components/     # calendar
```

## Domain Descriptions

### 1. Core
**Purpose**: Application-wide infrastructure and core functionality  
**Contains**: 
- Services: api, cache, data, database, general, location, modal, navigation, notifications, pwa
- Helpers: http.interceptor, app.initializer
- Models: api.models, dexie.models, idb.store.model, navigation.models, form.models
- Classes: dexie-crud

### 2. Shared
**Purpose**: Reusable UI components, pipes, and directives used across multiple features  
**Contains**:
- Components: atoms (buttons, forms, modals, etc.), elements (banners, dashboards, etc.), navigation
- Pipes: date filters, safe HTML, type conversions
- Directives: click-outside, tooltip, full-screen, etc.

### 3. Auth
**Purpose**: Authentication and authorization functionality  
**Contains**:
- Components: login
- Services: auth.service
- Guards: auth.guard
- Models: user.models

### 4. Public
**Purpose**: Public-facing pages accessible without authentication  
**Contains**: home, about, contact, first, resources, event-competition

### 5. Media
**Purpose**: Media galleries and content  
**Contains**: media, build-season, community-outreach, competition, wallpapers

### 6. Recruitment
**Purpose**: Team joining and recruitment pages  
**Contains**: join, electrical, impact, mechanical, programming, team-application

### 7. Sponsoring
**Purpose**: Sponsorship information and shop  
**Contains**: sponsoring, sponsor-shop

### 8. Scouting
**Purpose**: Competition scouting functionality  
**Contains**:
- Components: field-scouting, pit-scouting, responses, portal, strategizing
- Services: scouting.service
- Models: scouting.models

### 9. Scouting-Admin
**Purpose**: Administrative functions for scouting  
**Contains**: All scouting administration pages (manage questions, forms, responses, schedule, etc.)

### 10. Admin
**Purpose**: General administrative functions  
**Contains**: admin-users, meetings, error-log, phone-types, requested-items, security, team applications

### 11. User
**Purpose**: User profile and settings  
**Contains**:
- Components: profile
- Services: user.service

### 12. Attendance
**Purpose**: Meeting attendance tracking  
**Contains**:
- Components: attendance
- Models: attendance.models

### 13. Calendar
**Purpose**: Event calendar  
**Contains**: calendar component

## Migration Details

### Import Path Changes
All imports have been updated to reflect the new structure:

**Before:**
```typescript
import { AuthService } from './services/auth.service';
import { User } from './models/user.models';
import { authGuard } from './helpers/auth.guard';
```

**After:**
```typescript
import { AuthService } from './auth/services/auth.service';
import { User } from './auth/models/user.models';
import { authGuard } from './auth/helpers/auth.guard';
```

### Route Configuration
Lazy-loaded routes have been updated to use the new paths:
```typescript
// Old
loadComponent: () => import('./components/webpages/scouting/field-scouting/...')

// New
loadComponent: () => import('./scouting/components/scouting/field-scouting/...')
```

## Benefits of Domain-Based Structure

1. **Better Organization**: Related files are grouped together by feature
2. **Easier Navigation**: Finding files related to a specific feature is more intuitive
3. **Scalability**: New features can be added as self-contained domains
4. **Team Collaboration**: Teams can work on different domains with less conflict
5. **Code Splitting**: Domains can be lazy-loaded independently
6. **Encapsulation**: Each domain can have its own services, models, and components

## Guidelines for Adding New Features

1. **Determine the domain**: Is this a new domain or does it belong to an existing one?
2. **Create domain structure**: If new domain, create the folder with appropriate subfolders (components, services, models)
3. **Keep it cohesive**: Files within a domain should be related to that feature
4. **Use shared for reusables**: Common components, pipes, and directives go in `shared/`
5. **Use core for infrastructure**: App-wide services and utilities go in `core/`

## File Movement Log

All files have been moved from the type-based structure to the domain-based structure:
- Services moved from `services/` to respective domain folders
- Models moved from `models/` to respective domain folders
- Components moved from `components/webpages/` to domain `components/` folders
- Shared components moved to `shared/components/`
- Pipes moved to `shared/pipes/`
- Directives moved to `shared/directives/`
- Helpers and guards moved to appropriate domains

## Testing
All component tests have been preserved and should continue to work as they use relative imports.
