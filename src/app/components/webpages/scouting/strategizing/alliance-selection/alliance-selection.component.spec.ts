import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllianceSelectionComponent } from './alliance-selection.component';

describe('AllianceSelectionComponent', () => {
  let component: AllianceSelectionComponent;
  let fixture: ComponentFixture<AllianceSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllianceSelectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllianceSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
