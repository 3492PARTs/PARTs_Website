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
      this.gs.devConsoleLog('init pwa prompt');
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
        this.gs.devConsoleLog('User chose install pwa');
      } else {
        this.gs.devConsoleLog('User not install pwa');
      }
      this.promptEvent = null;
    });
  }

  public setInstallEligible(b: boolean): void {
    this.installEligiblePriv = b;
    this.installEligibleBS.next(this.installEligiblePriv);
  }
}
