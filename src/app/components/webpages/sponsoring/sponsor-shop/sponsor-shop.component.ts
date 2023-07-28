import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AuthCallStates, AuthService } from 'src/app/services/auth.service';
import { GeneralService } from 'src/app/services/general.service';
import { Item } from '../../admin/admin.component';

@Component({
  selector: 'app-sponsor-shop',
  templateUrl: './sponsor-shop.component.html',
  styleUrls: ['./sponsor-shop.component.scss']
})
export class SponsorShopComponent implements OnInit {
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
    this.authService.authInFlight.subscribe(r => r === AuthCallStates.comp ? this.getItems() : null);
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

  previewImage(link: string, id: string): void {
    this.gs.previewImage(link, id);
  }
}
