import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';


import { AlbumsComponent, Album } from './albums.component';

describe('AlbumsComponent', () => {
  let component: AlbumsComponent;
  let fixture: ComponentFixture<AlbumsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlbumsComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AlbumsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty Albums array', () => {
    expect(component.Albums).toEqual([]);
  });

  it('should accept Albums input', () => {
    const testAlbums: Album[] = [
      { imgSrc: 'test.jpg', label: 'Test Album' }
    ];
    
    component.Albums = testAlbums;
    fixture.detectChanges();
    
    expect(component.Albums.length).toBe(1);
    expect(component.Albums[0].label).toBe('Test Album');
  });

  describe('toggleVisibility', () => {
    let mockElement: HTMLElement;
    let mockLinksElement: HTMLElement;

    beforeEach(() => {
      mockLinksElement = document.createElement('div');
      mockLinksElement.style.height = '0px';
      Object.defineProperty(mockLinksElement, 'scrollHeight', {
        value: 200,
        writable: true
      });

      mockElement = document.createElement('div');
      mockElement.appendChild(document.createElement('div')); // First child
      mockElement.appendChild(mockLinksElement); // Second child (links element)
    });

    it('should expand element when height is 0px', () => {
      const event = { currentTarget: mockElement } as unknown as Event;
      
      component.toggleVisibility(event);
      
      expect(mockLinksElement.style.height).toBe('200px');
    });

    it('should collapse element when height is set', () => {
      mockLinksElement.style.height = '200px';
      const event = { currentTarget: mockElement } as unknown as Event;
      
      component.toggleVisibility(event);
      
      expect(mockLinksElement.style.height).toBe('0px');
    });

    it('should expand element when height is empty string', () => {
      mockLinksElement.style.height = '';
      const event = { currentTarget: mockElement } as unknown as Event;
      
      component.toggleVisibility(event);
      
      expect(mockLinksElement.style.height).toBe('200px');
    });

    it('should force close element when forceClose is true', () => {
      mockLinksElement.style.height = '200px';
      const event = { currentTarget: mockElement } as unknown as Event;
      
      component.toggleVisibility(event, true);
      
      expect(mockLinksElement.style.height).toBe('0px');
    });

    it('should force close element even when already closed', () => {
      mockLinksElement.style.height = '0px';
      const event = { currentTarget: mockElement } as unknown as Event;
      
      component.toggleVisibility(event, true);
      
      expect(mockLinksElement.style.height).toBe('0px');
    });

    it('should handle missing links element gracefully', () => {
      const emptyElement = document.createElement('div');
      const event = { currentTarget: emptyElement } as unknown as Event;
      
      expect(() => component.toggleVisibility(event)).not.toThrow();
    });
  });

  describe('Album class', () => {
    it('should create Album instance with default values', () => {
      const album = new Album();
      
      expect(album.routerLink).toBe('');
      expect(album.href).toBe('');
      expect(album.imgSrc).toBe('');
      expect(album.label).toBe('');
      expect(album.links).toEqual([]);
    });

    it('should allow setting routerLink', () => {
      const album = new Album();
      album.routerLink = '/test/path';
      
      expect(album.routerLink).toBe('/test/path');
    });

    it('should allow setting href', () => {
      const album = new Album();
      album.href = 'https://example.com';
      
      expect(album.href).toBe('https://example.com');
    });

    it('should allow setting links array', () => {
      const album = new Album();
      album.links = [
        { label: 'Link 1', href: 'url1' },
        { label: 'Link 2', href: 'url2' }
      ];
      
      expect(album.links?.length).toBe(2);
      expect(album.links?.[0].label).toBe('Link 1');
    });
  });
});
