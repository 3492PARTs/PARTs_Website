import { Component, OnInit } from '@angular/core';
import { APIService } from '../../../../services/api.service';
import { AuthService, AuthCallStates } from '../../../../services/auth.service';
import { GeneralService } from '../../../../services/general.service';
import { BoxComponent } from '../../../atoms/box/box.component';
import { TableColType, TableComponent } from '../../../atoms/table/table.component';
import { ModalComponent } from '../../../atoms/modal/modal.component';
import { FormComponent } from '../../../atoms/form/form.component';
import { FormElementComponent } from '../../../atoms/form-element/form-element.component';
import { ButtonComponent } from '../../../atoms/button/button.component';
import { ButtonRibbonComponent } from '../../../atoms/button-ribbon/button-ribbon.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-requested-items',
  standalone: true,
  imports: [BoxComponent, TableComponent, ModalComponent, FormComponent, FormElementComponent, ButtonComponent, ButtonRibbonComponent, CommonModule],
  templateUrl: './requested-items.component.html',
  styleUrls: ['./requested-items.component.scss']
})
export class RequestedItemsComponent implements OnInit {

  itemTableCols: TableColType[] = [
    { PropertyName: 'item_nm', ColLabel: 'Item' },
    { PropertyName: 'item_desc', ColLabel: 'Description' },
    { PropertyName: 'quantity', ColLabel: 'Quantity' },
    { PropertyName: 'sponsor_quantity', ColLabel: 'Donated' },
    { PropertyName: 'img_url', ColLabel: 'Image', Type: 'image' },
    { PropertyName: 'active', ColLabel: 'Active' },
  ];
  items: Item[] = [];
  activeItem = new Item();
  itemModalVisible = false;

  constructor(private api: APIService, private authService: AuthService, private gs: GeneralService) { }

  ngOnInit(): void {
    this.authService.authInFlight.subscribe((r) => {
      if (r === AuthCallStates.comp) {
        this.getItems();
      }
    });
  }

  getItems(): void {
    this.api.get(true, 'sponsoring/get-items/', undefined, (result: any) => {
      this.items = result as Item[];
    });
  }

  editItem(i = new Item()): void {
    this.activeItem = i;
    this.gs.previewImage(this.activeItem.img_url, 'item-image');
    this.itemModalVisible = true;
  }

  saveItem(): void {
    /*
    let formData = new FormData();
    //formData.append('file', this.form.get('profile').value);
    for (const [k, v] of Object.entries(this.activeItem)) {
      if (moment.isMoment(v)) {
        formData.append(k, v.format('YYYY-MM-DD'));
      }
      else
        formData.append(k, v);
    }
    this.api.post(true, 'sponsoring/save-item/', formData, (result: any) => {
      this.activeItem = new Item();
      this.itemModalVisible = false;
      this.getItems();
    });
    */
  }

  previewImage(link: string, id: string): void {
    this.gs.previewImage(link, id);
  }

  previewImageFile(): void {
    this.gs.previewImageFile(this.activeItem.img, this.loadImage.bind(this))
  }

  loadImage(ev: ProgressEvent<FileReader>): any {
    this.activeItem.img_url = ev.target?.result as string;
  }
}

export class Item {
  item_id!: number;
  item_nm = '';
  item_desc = '';
  quantity!: number;
  sponsor_quantity!: number;
  cart_quantity!: number;
  reset_date = new Date();
  active = 'y';
  img!: any;
  img_url = '';
  void_ind = '';
}

export class Sponsor {
  sponsor_id!: number;
  sponsor_nm = '';
  phone = '';
  email = '';
  can_send_emails = false;
  void_ind = '';
}