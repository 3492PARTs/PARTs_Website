import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  toTop(): void {
    const top = document.getElementById('top');
    top.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
  }
}
