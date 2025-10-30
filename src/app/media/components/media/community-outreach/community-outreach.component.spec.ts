import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MediaCommunityOutreachComponent } from './community-outreach.component';

describe('MediaCommunityOutreachComponent', () => {
  let component: MediaCommunityOutreachComponent;
  let fixture: ComponentFixture<MediaCommunityOutreachComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ MediaCommunityOutreachComponent ]
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
