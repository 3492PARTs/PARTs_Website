import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';


import { AllianceSelectionComponent } from './alliance-selection.component';

describe('AllianceSelectionComponent', () => {
  let component: AllianceSelectionComponent;
  let fixture: ComponentFixture<AllianceSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllianceSelectionComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
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
