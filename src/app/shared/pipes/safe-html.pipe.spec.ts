import { SafeHTMLPipe } from './safe-html.pipe';
import { DomSanitizer } from '@angular/platform-browser';
import { TestBed } from '@angular/core/testing';

describe('SafeHTMLPipe', () => {
  let pipe: SafeHTMLPipe;
  let sanitizer: DomSanitizer;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SafeHTMLPipe]
    });
    sanitizer = TestBed.inject(DomSanitizer);
    pipe = new SafeHTMLPipe(sanitizer);
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should transform HTML string to SafeHtml', () => {
    const htmlString = '<div>Test</div>';
    const result = pipe.transform(htmlString);
    expect(result).toBeTruthy();
  });

  it('should bypass security trust for HTML', () => {
    const htmlString = '<script>alert("test")</script>';
    const result = pipe.transform(htmlString);
    expect(result).toBeTruthy();
  });

  it('should handle empty string', () => {
    const result = pipe.transform('');
    expect(result).toBeTruthy();
  });

  it('should handle complex HTML', () => {
    const complexHtml = '<div class="test"><p>Paragraph</p><a href="#">Link</a></div>';
    const result = pipe.transform(complexHtml);
    expect(result).toBeTruthy();
  });
});
