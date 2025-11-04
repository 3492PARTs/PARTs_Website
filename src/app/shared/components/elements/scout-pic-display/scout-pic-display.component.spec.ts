import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { SimpleChange } from '@angular/core';


import { ScoutPicDisplayComponent } from './scout-pic-display.component';
import { ScoutPitImage } from '@app/scouting/models/scouting.models';
import { GeneralService } from '@app/core/services/general.service';

describe('ScoutPicDisplayComponent', () => {
  let component: ScoutPicDisplayComponent;
  let fixture: ComponentFixture<ScoutPicDisplayComponent>;
  let generalService: GeneralService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ ScoutPicDisplayComponent ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    });
    fixture = TestBed.createComponent(ScoutPicDisplayComponent);
    component = fixture.componentInstance;
    generalService = TestBed.inject(GeneralService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty ScoutPitImages array', () => {
    expect(component.ScoutPitImages).toEqual([]);
  });

  it('should initialize with empty PitImgTyp', () => {
    expect(component.PitImgTyp).toBe('');
  });

  it('should initialize with empty Title', () => {
    expect(component.Title).toBe('');
  });

  it('should initialize displayPicIndex to 0', () => {
    expect(component.displayPicIndex).toBe(0);
  });

  it('should generate unique elementId on init', () => {
    const comp2 = TestBed.createComponent(ScoutPicDisplayComponent).componentInstance;
    comp2.ngOnInit();
    
    expect(component.elementId).toBeTruthy();
    expect(component.elementId).not.toBe(comp2.elementId);
  });

  it('should accept ScoutPitImages input', () => {
    const mockImages: ScoutPitImage[] = [
      { id: 1, img_url: 'test1.jpg', default: false, pit_image_typ: { pit_image_typ: 'robot' } } as ScoutPitImage
    ];
    
    component.ScoutPitImages = mockImages;
    fixture.detectChanges();
    
    expect(component.ScoutPitImages.length).toBe(1);
  });

  it('should accept PitImgTyp input', () => {
    component.PitImgTyp = 'robot';
    fixture.detectChanges();
    
    expect(component.PitImgTyp).toBe('robot');
  });

  it('should accept Title input', () => {
    component.Title = 'Robot Images';
    fixture.detectChanges();
    
    expect(component.Title).toBe('Robot Images');
  });

  describe('Image navigation', () => {
    beforeEach(() => {
      component.ScoutPitImages = [
        { id: 1, img_url: 'img1.jpg', default: false, pit_image_typ: { pit_image_typ: 'robot' } } as ScoutPitImage,
        { id: 2, img_url: 'img2.jpg', default: false, pit_image_typ: { pit_image_typ: 'robot' } } as ScoutPitImage,
        { id: 3, img_url: 'img3.jpg', default: true, pit_image_typ: { pit_image_typ: 'robot' } } as ScoutPitImage
      ];
      component.displayPicIndex = 0;
    });

    it('should move to next image', () => {
      spyOn(component, 'preview');
      
      component.nextImage();
      
      expect(component.displayPicIndex).toBe(1);
      expect(component.preview).toHaveBeenCalledWith(1);
    });

    it('should wrap to first image when at end', () => {
      spyOn(component, 'preview');
      component.displayPicIndex = 2;
      
      component.nextImage();
      
      expect(component.displayPicIndex).toBe(0);
      expect(component.preview).toHaveBeenCalledWith(0);
    });

    it('should move to previous image', () => {
      spyOn(component, 'preview');
      component.displayPicIndex = 1;
      
      component.prevImage();
      
      expect(component.displayPicIndex).toBe(0);
      expect(component.preview).toHaveBeenCalledWith(0);
    });

    it('should wrap to last image when at beginning', () => {
      spyOn(component, 'preview');
      component.displayPicIndex = 0;
      
      component.prevImage();
      
      expect(component.displayPicIndex).toBe(2);
      expect(component.preview).toHaveBeenCalledWith(2);
    });
  });

  describe('setImages', () => {
    it('should filter images by PitImgTyp when set', () => {
      component.ScoutPitImages = [
        { id: 1, img_url: 'img1.jpg', pit_image_typ: { pit_image_typ: 'robot' } } as ScoutPitImage,
        { id: 2, img_url: 'img2.jpg', pit_image_typ: { pit_image_typ: 'drive' } } as ScoutPitImage
      ];
      component.PitImgTyp = 'robot';
      spyOn(component, 'preview');
      
      component.setImages();
      
      expect(component.ScoutPitImages.length).toBe(1);
      expect(component.ScoutPitImages[0].pit_image_typ.pit_image_typ).toBe('robot');
    });

    it('should not filter when PitImgTyp is empty', () => {
      component.ScoutPitImages = [
        { id: 1, img_url: 'img1.jpg', pit_image_typ: { pit_image_typ: 'robot' } } as ScoutPitImage,
        { id: 2, img_url: 'img2.jpg', pit_image_typ: { pit_image_typ: 'drive' } } as ScoutPitImage
      ];
      component.PitImgTyp = '';
      spyOn(component, 'preview');
      
      component.setImages();
      
      expect(component.ScoutPitImages.length).toBe(2);
    });

    it('should call preview after filtering', () => {
      spyOn(component, 'preview');
      
      component.setImages();
      
      expect(component.preview).toHaveBeenCalled();
    });
  });

  describe('ngOnChanges', () => {
    it('should call setImages when ScoutPitImages changes', () => {
      spyOn(component, 'setImages');
      
      component.ngOnChanges({
        ScoutPitImages: new SimpleChange([], [{ id: 1 }], false)
      });
      
      expect(component.setImages).toHaveBeenCalled();
    });

    it('should call setImages when PitImgTyp changes', () => {
      spyOn(component, 'setImages');
      
      component.ngOnChanges({
        PitImgTyp: new SimpleChange('', 'robot', false)
      });
      
      expect(component.setImages).toHaveBeenCalled();
    });

    it('should not call setImages for other property changes', () => {
      spyOn(component, 'setImages');
      
      component.ngOnChanges({
        Title: new SimpleChange('', 'New Title', false)
      });
      
      expect(component.setImages).not.toHaveBeenCalled();
    });
  });
});
