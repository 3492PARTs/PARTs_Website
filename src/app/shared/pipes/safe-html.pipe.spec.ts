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

  it('should handle HTML with inline styles', () => {
    const htmlWithStyles = '<div style="color: red; font-size: 16px;">Styled text</div>';
    const result = pipe.transform(htmlWithStyles);
    expect(result).toBeTruthy();
  });

  it('should handle HTML with event handlers (potential XSS)', () => {
    const xssHtml = '<div onclick="alert(\'xss\')">Click me</div>';
    const result = pipe.transform(xssHtml);
    expect(result).toBeTruthy();
  });

  it('should handle HTML with JavaScript protocol (potential XSS)', () => {
    const xssLink = '<a href="javascript:alert(\'xss\')">Click</a>';
    const result = pipe.transform(xssLink);
    expect(result).toBeTruthy();
  });

  it('should handle HTML with data URIs', () => {
    const dataUri = '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==">';
    const result = pipe.transform(dataUri);
    expect(result).toBeTruthy();
  });

  it('should handle HTML with special characters', () => {
    const specialChars = '<div>&lt;&gt;&amp;&quot;&#39;</div>';
    const result = pipe.transform(specialChars);
    expect(result).toBeTruthy();
  });

  it('should handle nested HTML structures', () => {
    const nestedHtml = '<div><ul><li><span>Item 1</span></li><li><span>Item 2</span></li></ul></div>';
    const result = pipe.transform(nestedHtml);
    expect(result).toBeTruthy();
  });

  it('should handle malformed HTML', () => {
    const malformedHtml = '<div><p>Unclosed paragraph<div>Another div</p>';
    const result = pipe.transform(malformedHtml);
    expect(result).toBeTruthy();
  });

  it('should handle HTML with SVG elements', () => {
    const svgHtml = '<svg width="100" height="100"><circle cx="50" cy="50" r="40" /></svg>';
    const result = pipe.transform(svgHtml);
    expect(result).toBeTruthy();
  });

  it('should handle HTML with form elements', () => {
    const formHtml = '<form><input type="text" name="test"><button>Submit</button></form>';
    const result = pipe.transform(formHtml);
    expect(result).toBeTruthy();
  });

  it('should handle whitespace-only content', () => {
    const whitespace = '   \n\t   ';
    const result = pipe.transform(whitespace);
    expect(result).toBeTruthy();
  });
});
