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
    let match = false;
    this.cart.forEach(cartItem => {
      if (cartItem.item_id === item.item_id) {
        match = true;
        cartItem.sponsor_quantity += item.sponsor_quantity;
      }
    });

    if (!match)
      this.cart.push(item);

    item.quantity -= item.sponsor_quantity;
    item.sponsor_quantity = 0;
  }

  openCartModal(): void {
    this.cartModalVisible = true;
  }

  previewImage(link: string, id: string): void {
    this.gs.previewImage(link, id);
  }
}
