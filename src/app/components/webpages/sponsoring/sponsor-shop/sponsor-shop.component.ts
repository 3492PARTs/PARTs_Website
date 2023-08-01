import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AuthCallStates, AuthService } from 'src/app/services/auth.service';
import { Banner, GeneralService } from 'src/app/services/general.service';
import { Item, Sponsor } from '../../admin/admin.component';

@Component({
  selector: 'app-sponsor-shop',
  templateUrl: './sponsor-shop.component.html',
  styleUrls: ['./sponsor-shop.component.scss']
})
export class SponsorShopComponent implements OnInit {
  sponsors: Sponsor[] = [];
  activeSponsor = new Sponsor();

  items: Item[] = [];
  cart: Item[] = [];
  cartTableCols: object[] = [
    { PropertyName: 'img_url', ColLabel: 'Image', Type: 'image', Width: '125px' },
    { PropertyName: 'item_nm', ColLabel: 'Item' },
    { PropertyName: 'sponsor_quantity', ColLabel: 'Quantity', Type: 'number', MinValue: 0, Width: '100px', FunctionCallBack: this.removeEmptyCartItem.bind(this) },
  ];

  cartModalVisible = false;

  constructor(private gs: GeneralService, private http: HttpClient, private authService: AuthService) { }

  ngOnInit(): void {
    this.authService.authInFlight.subscribe(r => r === AuthCallStates.comp ? this.initSponsorShop() : null);
  }

  initSponsorShop(): void {
    this.getItems();
    //this.getSponsors();
  }

  getItems(): void {
    this.gs.incrementOutstandingCalls();
    this.http.get(
      'sponsoring/get-items/'
    ).subscribe(
      {
        next: (result: any) => {
          if (this.gs.checkResponse(result)) {
            this.items = result as Item[];
          }
        },
        error: (err: any) => {
          console.log('error', err);
        },
        complete: () => {
          this.gs.decrementOutstandingCalls();
        }
      }
    );
  }

  getSponsors(): void {
    this.gs.incrementOutstandingCalls();
    this.http.get(
      'sponsoring/get-sponsors/'
    ).subscribe(
      {
        next: (result: any) => {
          if (this.gs.checkResponse(result)) {
            this.sponsors = result as Sponsor[];
          }
        },
        error: (err: any) => {
          console.log('error', err);
        },
        complete: () => {
          this.gs.decrementOutstandingCalls();
        }
      }
    );
  }

  addItemToCart(item: Item): void {
    if (item.sponsor_quantity > 0) {
      let match = false;
      this.cart.forEach(cartItem => {
        if (cartItem.item_id === item.item_id) {
          match = true;
          cartItem.sponsor_quantity += item.sponsor_quantity;
        }
      });

      if (!match)
        this.cart.push(this.gs.cloneObject(item));

      item.quantity -= item.sponsor_quantity;
      item.sponsor_quantity = 0;
    }
  }

  openCartModal(): void {
    this.cartModalVisible = true;
  }

  removeCartItem(item: Item): void {
    this.cart.splice(this.gs.arrayObjectIndexOf(this.cart, item.item_id, 'item_id'), 1);
    this.addItemBack(item, item.sponsor_quantity);
  }

  removeEmptyCartItem(item: Item): void {
    if (item.sponsor_quantity <= 0) this.cart.splice(this.gs.arrayObjectIndexOf(this.cart, item.item_id, 'item_id'), 1);
    //this.addItemBack(item, 1);
  }

  addItemBack(item: Item, quantity: number): void {
    this.items[this.gs.arrayObjectIndexOf(this.items, item.item_id, 'item_id')].quantity += quantity;
  }

  saveSponsorOrder(): void {
    let hasItem = false;
    this.cart.forEach(i => {
      if (i.sponsor_quantity > 0) hasItem = true;
    });

    if (!hasItem) {
      this.gs.addBanner(new Banner('Must have items to submit an order.', 3500));
      return;
    }

    if (this.gs.strNoE(this.activeSponsor.sponsor_nm) || this.gs.strNoE(this.activeSponsor.email) || this.gs.strNoE(this.activeSponsor.phone)) {
      this.gs.addBanner(new Banner('Please fill out all contact information.', 3500));
      return;
    }

    this.gs.incrementOutstandingCalls();
    this.http.post(
      'sponsoring/save-sponsor-order/', { items: this.cart, sponsor: this.activeSponsor }
    ).subscribe(
      {
        next: (result: any) => {
          if (this.gs.checkResponse(result)) {
            this.gs.addBanner(new Banner('Thank you for your donation!.', 5000));
            this.cart = [];
            this.activeSponsor = new Sponsor();
            this.initSponsorShop();
          }
        },
        error: (err: any) => {
          console.log('error', err);
        },
        complete: () => {
          this.gs.decrementOutstandingCalls();
        }
      }
    );
  }

  previewImage(link: string, id: string): void {
    this.gs.previewImage(link, id);
  }
}
