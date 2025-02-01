import { Component, Input } from '@angular/core';
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
export class ScoutPicDisplayComponent {
  @Input()
  set ScoutPitResult(spr: ScoutPitResponse) {
    this._ScoutPitResult = spr;
    this.preview(this._ScoutPitResult);
  }
  _ScoutPitResult = new ScoutPitResponse();

  constructor(private gs: GeneralService, private api: APIService) { }

  prevImage(sp: ScoutPitResponse): void {
    if (sp.display_pic_index - 1 < 0) sp.display_pic_index = sp.pics.length - 1;
    else sp.display_pic_index--;

    this.preview(sp, sp.display_pic_index)
  }

  nextImage(sp: ScoutPitResponse): void {
    if (sp.display_pic_index + 1 > sp.pics.length - 1) sp.display_pic_index = 0;
    else sp.display_pic_index++;

    this.preview(sp, sp.display_pic_index)
  }

  preview(sp: ScoutPitResponse, index?: number): void {
    if (sp && sp.pics.length > 0) {
      let link = '';

      if (index !== undefined) {
        link = sp.pics[index].img_url;
        sp.display_pic_index = index;
      }
      else {
        for (let i = 0; i < sp.pics.length; i++) {
          if (sp.pics[i].default) {
            sp.display_pic_index = i;
            link = sp.pics[i].img_url;
            break;
          }
        }

        if (this.gs.strNoE(link)) {
          link = sp.pics[0].img_url;
          sp.display_pic_index = 0;
        }
      }

      let el = document.getElementById(sp.team_no.toString());

      if (el) el.replaceChildren();

      LoadImg(
        link,
        (img: any) => {
          if (img && img.style) {
            img.style.width = '100%';
            img.style.height = 'auto';
            document.getElementById(sp.team_no.toString())!.appendChild(img);
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
      // TODO: need to emit this this.search();
      this._ScoutPitResult.pics.forEach(p => p.default = false);
      spi.default = true;
    }, (err: any) => {
      this.gs.triggerError(err);
    });
  }
}
