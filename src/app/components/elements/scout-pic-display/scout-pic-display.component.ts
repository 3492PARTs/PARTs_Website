import { Component, input, Input, OnInit } from '@angular/core';
import LoadImg from 'blueimp-load-image';
import { ScoutPitResponse, ScoutPitImage } from '../../../models/scouting.models';
import { APIService } from '../../../services/api.service';
import { GeneralService } from '../../../services/general.service';
import { ButtonComponent } from '../../atoms/button/button.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-scout-pic-display',
  imports: [ButtonComponent, CommonModule],
  templateUrl: './scout-pic-display.component.html',
  styleUrls: ['./scout-pic-display.component.scss']
})
export class ScoutPicDisplayComponent implements OnInit {
  @Input()
  set ScoutPitImages(spis: ScoutPitImage[]) {
    this._ScoutPitImages = spis.filter(spi => this.gs.strNoE(this.PitImgTyp) || this.PitImgTyp === spi.pit_image_typ.pit_image_typ);
    this.preview();
  }
  _ScoutPitImages: ScoutPitImage[] = [];

  @Input() set PitImgTyp(s: string) {
    this._PitImgTyp = s;
    this._ScoutPitImages = this._ScoutPitImages.filter(spi => this.gs.strNoE(this.PitImgTyp) || this.PitImgTyp === spi.pit_image_typ.pit_image_typ);
  }
  _PitImgTyp = '';

  displayPicIndex = 0;

  elementId = '';

  constructor(private gs: GeneralService, private api: APIService) { }

  ngOnInit(): void {
    this.elementId = this.gs.getNextGsId();
  }

  prevImage(): void {
    if (this.displayPicIndex - 1 < 0) this.displayPicIndex = this._ScoutPitImages.length - 1;
    else this.displayPicIndex--;

    this.preview(this.displayPicIndex);
  }

  nextImage(): void {
    if (this.displayPicIndex + 1 > this._ScoutPitImages.length - 1) this.displayPicIndex = 0;
    else this.displayPicIndex++;

    this.preview(this.displayPicIndex);
  }

  preview(index?: number): void {
    if (this._ScoutPitImages.length > 0) {
      let link = '';

      if (index !== undefined) {
        link = this._ScoutPitImages[index].img_url;
        this.displayPicIndex = index;
      }
      else {
        for (let i = 0; i < this._ScoutPitImages.length; i++) {
          if (this._ScoutPitImages[i].default) {
            this.displayPicIndex = i;
            link = this._ScoutPitImages[i].img_url;
            break;
          }
        }

        if (this.gs.strNoE(link)) {
          link = this._ScoutPitImages[0].img_url;
          this.displayPicIndex = 0;
        }
      }

      let el = document.getElementById(this.elementId);

      if (el) el.replaceChildren();

      LoadImg(
        link,
        (img: any) => {
          if (img && img.style) {
            img.style.width = '100%';
            img.style.height = 'auto';
            document.getElementById(this.elementId)!.appendChild(img);
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
      this._ScoutPitImages.forEach(p => p.default = false);
      spi.default = true;
    }, (err: any) => {
      this.gs.triggerError(err);
    });
  }
}
