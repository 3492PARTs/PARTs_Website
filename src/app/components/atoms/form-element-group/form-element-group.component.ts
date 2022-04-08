import { Component, OnInit, Input, ContentChildren, QueryList, AfterContentInit, Renderer2 } from '@angular/core';
import { ButtonComponent } from '../button/button.component';
import { FormElementComponent } from '../form-element/form-element.component';

@Component({
  selector: 'app-form-element-group',
  templateUrl: './form-element-group.component.html',
  styleUrls: ['./form-element-group.component.scss']
})
export class FormElementGroupComponent implements AfterContentInit {
  @Input() Inline = false;
  @Input() MaxWidth = false;
  @Input() LabelText = '';
  @Input() InlineElements = false;
  //@Input() WrapElements = false;
  @ContentChildren(FormElementComponent)
  formElements: QueryList<FormElementComponent> = new QueryList<FormElementComponent>();
  @ContentChildren(ButtonComponent)
  buttons: QueryList<ButtonComponent> = new QueryList<ButtonComponent>();

  constructor(private renderer: Renderer2) { }


  ngAfterContentInit() {
    this.alignElements();
    this.formElements.changes.subscribe({
      next: (result: any) => {
        this.alignElements();
      },
      error: (err: any) => {
        console.log('error', err);
      },
      complete: () => {
        //console.log('comp');
      }
    });
  }

  alignElements(): void {
    window.setTimeout(() => {
      if (this.InlineElements) {
        if (this.formElements) {
          this.formElements.forEach(elem => {
            elem.FormGroupInline = true;
            elem.FormInline = true;
          });
        }

        if (this.buttons) {
          this.buttons.forEach(elem => {
            if (elem.button)
              this.renderer.setStyle(elem.button.nativeElement, 'vertical-align', 'bottom');
          });
        }
      }
    }, 1);
  }
}
