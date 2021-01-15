import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CommunityOutreachComponent } from './community-outreach.component';

describe('CommunityOutreachComponent', () => {
  let component: CommunityOutreachComponent;
  let fixture: ComponentFixture<CommunityOutreachComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CommunityOutreachComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommunityOutreachComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
