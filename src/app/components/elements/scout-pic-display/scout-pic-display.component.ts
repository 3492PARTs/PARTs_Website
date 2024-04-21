import { Component, Input } from '@angular/core';
import { GeneralService } from 'src/app/services/general.service';
import * as LoadImg from 'blueimp-load-image';
import { APIService } from 'src/app/services/api.service';
import { ScoutPitResponse, ScoutPitImage } from 'src/app/models/scouting.models';

@Component({
  selector: 'app-scout-pic-display',
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
        link = sp.pics[index].pic;
        sp.display_pic_index = index;
      }
      else {
        for (let i = 0; i < sp.pics.length; i++) {
          if (sp.pics[i].default) {
            sp.display_pic_index = i;
            link = sp.pics[i].pic;
            break;
          }
        }

        if (this.gs.strNoE(link)) {
          link = sp.pics[0].pic;
          sp.display_pic_index = 0;
        }
      }

      let el = document.getElementById(sp.team_no.toString());

      if (el) el.replaceChildren();

      LoadImg(
        link,
        (img: any) => {
          img.style.width = '100%';
          img.style.height = 'auto';
          document.getElementById(sp.team_no.toString())!.appendChild(img);
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
      scout_pit_img_id: spi.scout_pit_img_id
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
