import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { SwPush } from '@angular/service-worker';
import { createMockSwPush } from '../../../../../test-helpers';
import { WallpapersComponent } from './wallpapers.component';

describe('WallpapersComponent', () => {
  let component: WallpapersComponent;
  let fixture: ComponentFixture<WallpapersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WallpapersComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: SwPush, useValue: createMockSwPush() },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(WallpapersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have wallpaper albums', () => {
    expect(component.albums.length).toBeGreaterThan(0);
  });
});
