import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { PitScoutingComponent } from './pit-scouting.component';
import { APIService } from '@app/core/services/api.service';
import { AuthService } from '@app/auth/services/auth.service';
import { CacheService } from '@app/core/services/cache.service';
import { GeneralService } from '@app/core/services/general.service';
import { ScoutingService } from '@app/scouting/services/scouting.service';
import { createMockAPIService, createMockAuthService, createMockCacheService, createMockGeneralService, createMockScoutingService } from '../../../../test-helpers';

describe('PitScoutingComponent', () => {
  let component: PitScoutingComponent;
  let fixture: ComponentFixture<PitScoutingComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [PitScoutingComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: APIService, useValue: createMockAPIService() },
        { provide: AuthService, useValue: createMockAuthService() },
        { provide: CacheService, useValue: createMockCacheService() },
        { provide: GeneralService, useValue: createMockGeneralService() },
        { provide: ScoutingService, useValue: createMockScoutingService() }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PitScoutingComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
