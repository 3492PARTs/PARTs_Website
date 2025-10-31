import { Injectable } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { BehaviorSubject } from 'rxjs';
import { GeneralService } from './general.service';

import { ModalService } from '@app/core/services/modal.service';
@Injectable({
  providedIn: 'root'
})
export class PwaService {
  private promptEvent: any;

  private installEligiblePriv = false;
  private installEligibleBS = new BehaviorSubject<boolean>(this.installEligiblePriv);
  installEligible = this.installEligibleBS.asObservable();

  constructor(private swUpdate: SwUpdate, private gs: GeneralService, private modalService: ModalService) {
    this.initPwaPrompt();

    if (this.swUpdate.isEnabled) {
      console.log(`service worker running...`);
      this.swUpdate.checkForUpdate();
      setInterval(() => {
        this.swUpdate.checkForUpdate();
      }, 15 * 60 * 1000);
    }

    this.swUpdate.versionUpdates.subscribe(evt => {
      switch (evt.type) {
        case 'VERSION_DETECTED':
          console.log(`Downloading new app version: ${evt.version.hash}`);
          break;
        case 'VERSION_READY':
          console.log(`Current app version: ${evt.currentVersion.hash}`);
          console.log(`New app version ready for use: ${evt.latestVersion.hash}`);

          this.modalService.triggerConfirm('There is a new version of the site available. Would you like to refresh?', () => {
            // Reload the page to update to the latest version.
            document.location.reload();
          });
          break;
        case 'VERSION_INSTALLATION_FAILED':
          console.log(`Failed to install app version '${evt.version.hash}': ${evt.error}`);
          break;
      }
    });
  }

  public initPwaPrompt() {
    window.addEventListener('beforeinstallprompt', (event: any) => {
      //console.log('init pwa');
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
