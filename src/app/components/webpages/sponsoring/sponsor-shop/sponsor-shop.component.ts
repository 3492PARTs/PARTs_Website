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

  previewImage(link: string, id: string): void {
    this.gs.previewImage(link, id);
  }
}
