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

  it('should handle null input gracefully', () => {
    const result = pipe.transform(null as any);
    expect(result).toBeTruthy();
  });

  it('should handle undefined input gracefully', () => {
    const result = pipe.transform(undefined as any);
    expect(result).toBeTruthy();
  });

  it('should handle very long HTML strings', () => {
    const longHtml = '<div>' + 'a'.repeat(10000) + '</div>';
    const result = pipe.transform(longHtml);
    expect(result).toBeTruthy();
  });

  it('should handle HTML with comments', () => {
    const htmlWithComments = '<div><!-- This is a comment --><p>Content</p></div>';
    const result = pipe.transform(htmlWithComments);
    expect(result).toBeTruthy();
  });

  it('should handle HTML with CDATA sections', () => {
    const htmlWithCDATA = '<div><![CDATA[Some data]]></div>';
    const result = pipe.transform(htmlWithCDATA);
    expect(result).toBeTruthy();
  });

  it('should handle HTML entities', () => {
    const entities = '<div>&nbsp;&copy;&reg;&trade;</div>';
    const result = pipe.transform(entities);
    expect(result).toBeTruthy();
  });

  it('should handle HTML with iframe elements', () => {
    const iframeHtml = '<iframe src="https://example.com"></iframe>';
    const result = pipe.transform(iframeHtml);
    expect(result).toBeTruthy();
  });

  it('should handle HTML with object and embed tags', () => {
    const objectHtml = '<object data="file.pdf"></object>';
    const result = pipe.transform(objectHtml);
    expect(result).toBeTruthy();
  });

  it('should handle HTML with meta tags', () => {
    const metaHtml = '<meta charset="UTF-8"><meta name="description" content="Test">';
    const result = pipe.transform(metaHtml);
    expect(result).toBeTruthy();
  });

  it('should handle HTML with doctype', () => {
    const doctypeHtml = '<!DOCTYPE html><html><body>Content</body></html>';
    const result = pipe.transform(doctypeHtml);
    expect(result).toBeTruthy();
  });

  it('should handle HTML tables', () => {
    const tableHtml = '<table><tr><td>Cell 1</td><td>Cell 2</td></tr></table>';
    const result = pipe.transform(tableHtml);
    expect(result).toBeTruthy();
  });

  it('should handle HTML with multiple script tags', () => {
    const multipleScripts = '<script>code1()</script><div>Content</div><script>code2()</script>';
    const result = pipe.transform(multipleScripts);
    expect(result).toBeTruthy();
  });

  it('should handle HTML with CSS style tags', () => {
    const styleTag = '<style>.class { color: red; }</style><div class="class">Text</div>';
    const result = pipe.transform(styleTag);
    expect(result).toBeTruthy();
  });

  it('should handle HTML with link tags', () => {
    const linkTag = '<link rel="stylesheet" href="style.css">';
    const result = pipe.transform(linkTag);
    expect(result).toBeTruthy();
  });

  it('should handle HTML with base64 encoded images', () => {
    const base64Img = '<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciLz4=">';
    const result = pipe.transform(base64Img);
    expect(result).toBeTruthy();
  });

  it('should handle HTML with video elements', () => {
    const videoHtml = '<video controls><source src="video.mp4" type="video/mp4"></video>';
    const result = pipe.transform(videoHtml);
    expect(result).toBeTruthy();
  });

  it('should handle HTML with audio elements', () => {
    const audioHtml = '<audio controls><source src="audio.mp3" type="audio/mpeg"></audio>';
    const result = pipe.transform(audioHtml);
    expect(result).toBeTruthy();
  });

  it('should handle HTML with canvas elements', () => {
    const canvasHtml = '<canvas id="myCanvas" width="200" height="100"></canvas>';
    const result = pipe.transform(canvasHtml);
    expect(result).toBeTruthy();
  });

  it('should handle plain text without HTML tags', () => {
    const plainText = 'This is just plain text without any HTML tags';
    const result = pipe.transform(plainText);
    expect(result).toBeTruthy();
  });

  it('should handle text with angle brackets that are not HTML', () => {
    const text = 'Math expression: 5 < 10 and 20 > 15';
    const result = pipe.transform(text);
    expect(result).toBeTruthy();
  });

  it('should handle HTML with template tags', () => {
    const templateHtml = '<template><div>Template content</div></template>';
    const result = pipe.transform(templateHtml);
    expect(result).toBeTruthy();
  });

  it('should handle HTML with custom elements', () => {
    const customElement = '<my-custom-element data-value="test">Content</my-custom-element>';
    const result = pipe.transform(customElement);
    expect(result).toBeTruthy();
  });

  it('should handle HTML with multiple attributes', () => {
    const multiAttr = '<div id="test" class="container" data-value="123" aria-label="description">Content</div>';
    const result = pipe.transform(multiAttr);
    expect(result).toBeTruthy();
  });

  it('should handle self-closing tags', () => {
    const selfClosing = '<br/><hr/><img src="test.png"/>';
    const result = pipe.transform(selfClosing);
    expect(result).toBeTruthy();
  });

  it('should handle mixed case HTML tags', () => {
    const mixedCase = '<DIV><P>Mixed Case Tags</P></DIV>';
    const result = pipe.transform(mixedCase);
    expect(result).toBeTruthy();
  });
});
