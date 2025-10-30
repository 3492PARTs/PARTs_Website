import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';


import { MediaCommunityOutreachComponent } from './community-outreach.component';

describe('MediaCommunityOutreachComponent', () => {
  let component: MediaCommunityOutreachComponent;
  let fixture: ComponentFixture<MediaCommunityOutreachComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ MediaCommunityOutreachComponent ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MediaCommunityOutreachComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have albums defined', () => {
    expect(component.albums).toBeDefined();
    expect(component.albums.length).toBeGreaterThan(0);
  });
});
