import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { SwPush } from '@angular/service-worker';
import { APIService } from '@app/core/services/api.service';
import { createMockSwPush } from '../../../../test-helpers';
import { ResourcesComponent } from './resources.component';

describe('ResourcesComponent', () => {
  let component: ResourcesComponent;
  let fixture: ComponentFixture<ResourcesComponent>;
  let mockAPI: jasmine.SpyObj<APIService>;

  beforeEach(async () => {
    mockAPI = jasmine.createSpyObj('APIService', ['get']);
    mockAPI.get.and.returnValue(Promise.resolve({ season: 2025, game: 'Reefscape', manual: 'http://example.com/manual.pdf' }));

    await TestBed.configureTestingModule({
      imports: [ResourcesComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: SwPush, useValue: createMockSwPush() },
        { provide: APIService, useValue: mockAPI },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(ResourcesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default resources defined', () => {
    expect(component.resources.length).toBeGreaterThan(0);
  });

  it('openURL should call window.open', () => {
    spyOn(window, 'open');
    component.openURL('https://example.com');
    expect(window.open).toHaveBeenCalledWith('https://example.com', 'noopener');
  });

  it('should add season resource after API resolves', async () => {
    const initialCount = component.resources.length;
    await fixture.whenStable();
    expect(component.resources.length).toBe(initialCount + 1);
  });
});
