import { Component, OnInit } from '@angular/core';
import { Sponsor, Item } from '../../admin/requested-items/requested-items.component';
import { Banner } from '../../../../models/api.models';
import { APIService } from '../../../../core/services/api.service';
import { AuthService, AuthCallStates } from '../../../../auth/services/auth.service';
import { GeneralService } from '../../../../core/services/general.service';
import { MainViewComponent } from '../../../../shared/components/atoms/main-view/main-view.component';
import { BoxComponent } from '../../../../shared/components/atoms/box/box.component';
import { ModalComponent } from '../../../../shared/components/atoms/modal/modal.component';
import { ButtonComponent } from '../../../../shared/components/atoms/button/button.component';
import { ButtonRibbonComponent } from '../../../../shared/components/atoms/button-ribbon/button-ribbon.component';
import { TableColType, TableComponent } from '../../../../shared/components/atoms/table/table.component';
import { FormElementComponent } from '../../../../shared/components/atoms/form-element/form-element.component';
import { FormElementGroupComponent } from '../../../../shared/components/atoms/form-element-group/form-element-group.component';

import { FormComponent } from '../../../../shared/components/atoms/form/form.component';

@Component({
    selector: 'app-sponsor-shop',
    imports: [MainViewComponent, BoxComponent, ModalComponent, ButtonComponent, ButtonRibbonComponent, TableComponent, FormElementComponent, FormElementGroupComponent, FormComponent],
    templateUrl: './sponsor-shop.component.html',
    styleUrls: ['./sponsor-shop.component.scss']
})
export class SponsorShopComponent implements OnInit {
  sponsors: Sponsor[] = [];
  activeSponsor = new Sponsor();

  items: Item[] = [];
  cart: Item[] = [];
  cartTableCols: TableColType[] = [
    { PropertyName: 'img_url', ColLabel: 'Image', Type: 'image', Width: '125px' },
    { PropertyName: 'item_nm', ColLabel: 'Item' },
    { PropertyName: 'cart_quantity', ColLabel: 'Quantity', Type: 'number', MinValue: 0, Width: '100px', FunctionCallBack: this.removeEmptyCartItem.bind(this) },
  ];

  cartModalVisible = false;

  constructor(private gs: GeneralService, private api: APIService, private authService: AuthService) { }

  ngOnInit(): void {
    this.authService.authInFlight.subscribe(r => r === AuthCallStates.comp ? this.initSponsorShop() : null);
  }

  initSponsorShop(): void {
    this.getItems();
    //this.getSponsors();
  }

  getItems(): void {
    this.api.get(true, 'sponsoring/get-items/', undefined, (result: any) => {
      this.items = result as Item[];
    });
  }

  getSponsors(): void {
    this.api.get(true, 'sponsoring/get-sponsors/', undefined, (result: any) => {
      this.sponsors = result as Sponsor[];
    });
  }

  addItemToCart(item: Item): void {
    if (item.cart_quantity > 0) {
      let match = false;
      this.cart.forEach(cartItem => {
        if (cartItem.item_id === item.item_id) {
          match = true;
          cartItem.cart_quantity += item.cart_quantity;
        }
      });

      if (!match)
        this.cart.push(this.gs.cloneObject(item));

      item.sponsor_quantity += item.cart_quantity;
      item.cart_quantity = 0;
    }
  }

  openCartModal(): void {
    this.cartModalVisible = true;
  }

  removeCartItem(item: Item): void {
    this.cart.splice(this.gs.arrayObjectIndexOf(this.cart, 'item_id', item.item_id), 1);
    this.addItemBack(item, item.cart_quantity);
  }

  removeEmptyCartItem(item: Item): void {
    if (item.cart_quantity <= 0) this.cart.splice(this.gs.arrayObjectIndexOf(this.cart, 'item_id', item.item_id), 1);
    //this.addItemBack(item, 1);
  }

  addItemBack(item: Item, quantity: number): void {
    this.items[this.gs.arrayObjectIndexOf(this.items, 'item_id', item.item_id)].sponsor_quantity -= quantity;
  }

  saveSponsorOrder(): void {
    let hasItem = false;
    this.cart.forEach(i => {
      if (i.cart_quantity > 0) hasItem = true;
    });

    if (!hasItem) {
      this.gs.addBanner(new Banner(0, 'Must have items to submit an order.', 3500));
      return;
    }

    if (this.gs.strNoE(this.activeSponsor.sponsor_nm) || this.gs.strNoE(this.activeSponsor.email) || this.gs.strNoE(this.activeSponsor.phone)) {
      this.gs.addBanner(new Banner(0, 'Please fill out all contact information.', 3500));
      return;
    }

    this.api.post(true, 'sponsoring/save-sponsor-order/', { items: this.cart, sponsor: this.activeSponsor }, (result: any) => {
      this.gs.addBanner(new Banner(0, 'Thank you for your donation!.', 5000));
      this.cart = [];
      this.activeSponsor = new Sponsor();
      this.initSponsorShop();
    });
  }

  previewImage(link: string, id: string): void {
    this.gs.previewImage(link, id);
  }
}
