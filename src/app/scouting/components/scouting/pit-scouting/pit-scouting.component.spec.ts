import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { PitScoutingComponent } from './pit-scouting.component';
import { APIService } from '@app/core/services/api.service';
import { AuthService } from '@app/auth/services/auth.service';
import { CacheService } from '@app/core/services/cache.service';
import { GeneralService } from '@app/core/services/general.service';
import { ScoutingService } from '@app/scouting/services/scouting.service';
import { of } from 'rxjs';

describe('PitScoutingComponent', () => {
  let component: PitScoutingComponent;
  let fixture: ComponentFixture<PitScoutingComponent>;
  let mockAPIService: any;
  let mockAuthService: any;
  let mockCacheService: any;
  let mockGeneralService: any;
  let mockScoutingService: any;

  beforeEach(waitForAsync(() => {
    mockAPIService = {
      get: jasmine.createSpy('get').and.returnValue(of({ data: [] }))
    };

    mockAuthService = {
      user: { user_id: 1 }
    };

    mockCacheService = {
      get: jasmine.createSpy('get').and.returnValue(of(null)),
      set: jasmine.createSpy('set').and.returnValue(of(null))
    };

    mockGeneralService = {
      addSiteBanner: jasmine.createSpy('addSiteBanner')
    };

    mockScoutingService = {
      currentSeason: of({ season_id: 1 })
    };

    TestBed.configureTestingModule({
      imports: [PitScoutingComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        { provide: APIService, useValue: mockAPIService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: CacheService, useValue: mockCacheService },
        { provide: GeneralService, useValue: mockGeneralService },
        { provide: ScoutingService, useValue: mockScoutingService }
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
