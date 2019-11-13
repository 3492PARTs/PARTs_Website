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
    this.showErrorModal = true;
    this.errorMessage = mesage;
  }



  handelHTTPError(Error: any) {
    this.triggerError('http error');
  }


  checkRetRes(ResponseObject: any): boolean {
    if (ResponseObject.RetMessage != null && ResponseObject.RetMessage.Error) {
      this.triggerError(ResponseObject.RetMessage.Message);
      return false;
    }
    return true;
  }

}
