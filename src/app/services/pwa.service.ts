import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { GeneralService } from './general.service';

@Injectable({
  providedIn: 'root'
})
export class PwaService {
  private promptEvent: any;

  private installEligiblePriv = false;
  private installEligibleBS = new BehaviorSubject<boolean>(this.installEligiblePriv);
  installEligible = this.installEligibleBS.asObservable();

  constructor(private gs: GeneralService) {
    this.initPwaPrompt();
  }

  public initPwaPrompt() {
    window.addEventListener('beforeinstallprompt', (event: any) => {
      console.log('init pwa');
      event.preventDefault();
      this.promptEvent = event;
      this.setInstallEligible(true);
    });
  }

  public installPwa() {
    this.setInstallEligible(false);
    this.promptEvent.prompt();
    this.promptEvent.userChoice.then((choiceResult: { outcome: string; }) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('install pwa');
      } else {
        console.log('not install pwa');
      }
      this.promptEvent = null;
    });
  }

  public setInstallEligible(b: boolean): void {
    this.installEligiblePriv = b;
    this.installEligibleBS.next(this.installEligiblePriv);
  }
}
