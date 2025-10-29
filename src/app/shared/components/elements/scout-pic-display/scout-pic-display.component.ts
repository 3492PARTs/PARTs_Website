import { Component, input, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import LoadImg from 'blueimp-load-image';
import { ScoutPitResponse, ScoutPitImage } from '../../../scouting/models/scouting.models';
import { APIService } from '../../../../core/services/api.service';
import { GeneralService } from '../../../../core/services/general.service';
import { ButtonComponent } from '../../../shared/components/atoms/button/button.component';

import { HeaderComponent } from "../../atoms/header/header.component";

@Component({
  selector: 'app-scout-pic-display',
  imports: [ButtonComponent, HeaderComponent],
  templateUrl: './scout-pic-display.component.html',
  styleUrls: ['./scout-pic-display.component.scss']
})
export class ScoutPicDisplayComponent implements OnInit, OnChanges {
  @Input() ScoutPitImages: ScoutPitImage[] = [];

  @Input() PitImgTyp = '';

  @Input() Title = '';

  displayPicIndex = 0;

  elementId = '';

  constructor(private gs: GeneralService, private api: APIService) { }

  ngOnInit(): void {
    this.elementId = this.gs.getNextGsId();
    this.setImages();
  }

  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        switch (propName) {
          case 'ScoutPitImages':
          case 'PitImgTyp':
            this.setImages();
            break;
        }
      }
    }
  }

  setImages(): void {
    this.ScoutPitImages = this.ScoutPitImages.filter(spi => this.gs.strNoE(this.PitImgTyp) || this.PitImgTyp === spi.pit_image_typ.pit_image_typ);
    this.preview();
  }

  prevImage(): void {
    if (this.displayPicIndex - 1 < 0) this.displayPicIndex = this.ScoutPitImages.length - 1;
    else this.displayPicIndex--;

    this.preview(this.displayPicIndex);
  }

  nextImage(): void {
    if (this.displayPicIndex + 1 > this.ScoutPitImages.length - 1) this.displayPicIndex = 0;
    else this.displayPicIndex++;

    this.preview(this.displayPicIndex);
  }

  preview(index?: number): void {
    if (this.ScoutPitImages.length > 0) {
      let link = '';

      if (index !== undefined) {
        link = this.ScoutPitImages[index].img_url;
        this.displayPicIndex = index;
      }
      else {
        for (let i = 0; i < this.ScoutPitImages.length; i++) {
          if (this.ScoutPitImages[i].default) {
            this.displayPicIndex = i;
            link = this.ScoutPitImages[i].img_url;
            break;
          }
        }

        if (this.gs.strNoE(link)) {
          link = this.ScoutPitImages[0].img_url;
          this.displayPicIndex = 0;
        }
      }


      LoadImg(
        link,
        (img: any) => {
          if (img && img.style) {
            img.style.width = '100%';
            img.style.height = 'auto';
            let el = document.getElementById(this.elementId);

            if (el) {
              el.replaceChildren();
              el.appendChild(img);
            }
          }
        },
        {
          //maxWidth: 600,
          //maxHeight: 300,
          //minWidth: 100,
          //minHeight: 50,
          //canvas: true,
          orientation: true
        }
      );
    }
  }

  setDefaultPic(spi: ScoutPitImage): void {
    this.api.get(true, 'scouting/pit/set-default-pit-image/', {
      scout_pit_img_id: spi.id
    }, (result: any) => {
      this.gs.successfulResponseBanner(result);
      this.ScoutPitImages.forEach(p => p.default = false);
      spi.default = true;
    }, (err: any) => {
      this.gs.triggerError(err);
    });
  }
}
