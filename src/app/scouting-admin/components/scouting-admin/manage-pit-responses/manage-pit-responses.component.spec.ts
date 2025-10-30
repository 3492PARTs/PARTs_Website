import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagePitResponsesComponent } from './manage-pit-responses.component';

describe('ManagePitResponsesComponent', () => {
  let component: ManagePitResponsesComponent;
  let fixture: ComponentFixture<ManagePitResponsesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ ManagePitResponsesComponent ]
    });
    fixture = TestBed.createComponent(ManagePitResponsesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
