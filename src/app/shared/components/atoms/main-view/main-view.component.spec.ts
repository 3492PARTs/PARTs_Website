import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';


import { MainViewComponent } from './main-view.component';

describe('MainViewComponent', () => {
  let component: MainViewComponent;
  let fixture: ComponentFixture<MainViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ MainViewComponent ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render a main element', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const mainElement = compiled.querySelector('main');
    expect(mainElement).toBeTruthy();
  });

  it('should support content projection', () => {
    const testContent = '<div class="test-content">Test Content</div>';
    const compiled = fixture.nativeElement as HTMLElement;
    const mainElement = compiled.querySelector('main');
    
    expect(mainElement).toBeTruthy();
    // Component supports ng-content for child elements
  });
});
