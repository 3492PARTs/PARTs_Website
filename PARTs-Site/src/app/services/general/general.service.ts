import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GeneralService {

  /* Loading Screen */
  private outstandingCalls = new BehaviorSubject<number>(0);
  currentOutstandingCalls = this.outstandingCalls.asObservable();
  private internalOutstandingCalls = 0;

  /* Error Handeling*/
  showErrorModal = false;
  errorMessage = '';
  buttonText = 'Ok';

  private gsId = 0;

  constructor() { }


  /* Loading Screen */
  incrementOutstandingCalls() {
    this.internalOutstandingCalls++;
    this.outstandingCalls.next(this.internalOutstandingCalls);
  }

  decrementOutstandingCalls() {
    if (this.internalOutstandingCalls > 0) {
      this.internalOutstandingCalls--;
      this.outstandingCalls.next(this.internalOutstandingCalls);
    }
  }

  /* Error Service */
  acceptError() {
    this.showErrorModal = false;
    this.errorMessage = '';
  }

  triggerError(mesage: string) {
    // this.showErrorModal = true;
    this.errorMessage = mesage;
    alert(this.errorMessage);
  }

  handelHTTPError(Error: any) {
    this.triggerError('http error');
  }

  checkResponse(response: any): boolean {
    response = response as RetMessage;
    if (response.retMessage && response.error) {
      this.triggerError(response.retMessage);
      return false;
    }
    return true;
  }

  getNextGsId(): string {
    return 'gsID' + this.gsId++;
  }
}

export class RetMessage {
  retMessage: string;
  error: boolean;
}
