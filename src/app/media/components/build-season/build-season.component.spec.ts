import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { SwPush } from '@angular/service-worker';
import { createMockSwPush } from '../../../../test-helpers';
import { BuildSeasonComponent } from './build-season.component';

describe('BuildSeasonComponent', () => {
  let component: BuildSeasonComponent;
  let fixture: ComponentFixture<BuildSeasonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BuildSeasonComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: SwPush, useValue: createMockSwPush() },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(BuildSeasonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have albums defined', () => {
    expect(component.albums.length).toBeGreaterThan(0);
  });
});
