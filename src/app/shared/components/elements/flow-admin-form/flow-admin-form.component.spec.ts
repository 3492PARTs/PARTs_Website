import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';


import { FlowAdminFormComponent } from './flow-admin-form.component';

describe('FlowAdminFormComponent', () => {
  let component: FlowAdminFormComponent;
  let fixture: ComponentFixture<FlowAdminFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlowAdminFormComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlowAdminFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
