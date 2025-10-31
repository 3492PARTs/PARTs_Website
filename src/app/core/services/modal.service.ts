import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Banner } from '../models/api.models';
import { strNoE, objectToString } from '../utils/utils.functions';
import { GeneralService } from './general.service';

/**
 * ModalService - Service for managing modal dialogs, errors, and confirmations
 * Following Angular best practices as an injectable service
 */
@Injectable({
  providedIn: 'root'
})
export class ModalService {
  constructor(private gs: GeneralService) {}
  /* Error Modal State */
  private showErrorModalBS = new BehaviorSubject<boolean>(false);
  showErrorModal$ = this.showErrorModalBS.asObservable();
  private errorMessageBS = new BehaviorSubject<string>('');
  errorMessage$ = this.errorMessageBS.asObservable();
  errorButtonText = 'OK';

  /* Confirm Modal State */
  private showConfirmModalBS = new BehaviorSubject<boolean>(false);
  showConfirmModal$ = this.showConfirmModalBS.asObservable();
  private confirmMessageBS = new BehaviorSubject<string>('');
  confirmMessage$ = this.confirmMessageBS.asObservable();
  confirmButtonText = 'OK';
  confirmButtonCancelText = 'NO';

  private confirmFx: (() => void) | undefined | null;
  private rejectConfirmFx: (() => void) | undefined | null;

  /* Modal Visibility Counter */
  private modalVisibleCount = 0;
  private currentModalVisibleBS = new BehaviorSubject<number>(0);
  currentModalVisible = this.currentModalVisibleBS.asObservable();

  /**
   * Get current error modal visibility state
   */
  get showErrorModal(): boolean {
    return this.showErrorModalBS.value;
  }

  /**
   * Get current error message
   */
  get errorMessage(): string {
    return this.errorMessageBS.value;
  }

  /**
   * Get current confirm modal visibility state
   */
  get showConfirmModal(): boolean {
    return this.showConfirmModalBS.value;
  }

  /**
   * Get current confirm message
   */
  get confirmMessage(): string {
    return this.confirmMessageBS.value;
  }

  /**
   * Accept and close error modal
   */
  acceptError(): void {
    this.showErrorModalBS.next(false);
    this.errorMessageBS.next('');
  }

  /**
   * Trigger an error modal with a message
   */
  triggerError(message: any): void {
    this.showErrorModalBS.next(true);

    if (typeof message === 'object' && message !== null && 'message' in message && message.message) {
      this.errorMessageBS.next(message.message);
    }
    else if (typeof message === 'object' && message !== null && 'retMessage' in message && message.retMessage) {
      this.errorMessageBS.next(message.retMessage);
    }
    else {
      this.errorMessageBS.next(message);
    }
  }

  /**
   * Trigger a confirmation modal
   */
  triggerConfirm(message: string, tmpConfirmFx: () => void, tmpRejectConfirmFx?: () => void): void {
    this.confirmMessageBS.next('');
    this.confirmFx = null;
    this.rejectConfirmFx = null;

    this.showConfirmModalBS.next(true);
    this.confirmMessageBS.next(message);

    this.confirmFx = tmpConfirmFx;
    this.rejectConfirmFx = tmpRejectConfirmFx;
  }

  /**
   * Accept confirmation and execute callback
   */
  acceptConfirm(): void {
    this.showConfirmModalBS.next(false);
    if (this.confirmFx) this.confirmFx();
  }

  /**
   * Reject confirmation and execute callback
   */
  rejectConfirm(): void {
    this.showConfirmModalBS.next(false);
    if (this.rejectConfirmFx) this.rejectConfirmFx();
  }

  /**
   * Check API response and show banner if error
   * @param response The API response to check
   * @returns true if response is valid, false if error
   */
  checkResponse(response: any): boolean {
    const retMessage = response as { retMessage?: string; error?: boolean; errorMessage?: string };
    if (retMessage.retMessage && retMessage.error) {
      const message = retMessage.errorMessage 
        ? objectToString(JSON.parse(retMessage.errorMessage)) 
        : retMessage.retMessage;
      this.gs.addBanner(new Banner(0, message, 5000));
      return false;
    }
    return true;
  }

  /**
   * Show success banner from API response
   * @param response The API response
   */
  successfulResponseBanner(response: any): void {
    const message = (response as { retMessage?: string }).retMessage;
    if (!strNoE(message)) {
      this.gs.addBanner(new Banner(0, message!, 3500));
    }
  }

  /**
   * Trigger form validation banner
   * @param invalidFields Array of invalid field names
   */
  triggerFormValidationBanner(invalidFields: string[]): void {
    let ret = '';
    invalidFields.forEach(s => {
      ret += `&bull;  ${s} is invalid\n`;
    });

    this.gs.addBanner(new Banner(0, ret, 3500));
  }

  /**
   * Handle HTTP error and show error modal
   * @param error The HTTP error
   * @param decrementCallsFn Function to decrement outstanding calls (from GeneralService)
   */
  handleHTTPError(error: any, decrementCallsFn?: () => void): void {
    let errorText = '';

    if (typeof (error.error) === 'object') {
      for (let [key, value] of Object.entries(error.error)) {
        errorText += value + '\n';
      }
    }
    else {
      errorText = error.statusText;
    }

    this.triggerError(errorText);
    if (decrementCallsFn) decrementCallsFn();
  }

  /**
   * Increment the count of visible modals
   */
  incrementModalVisibleCount(): number {
    this.modalVisibleCount++;
    this.currentModalVisibleBS.next(this.modalVisibleCount);
    return this.modalVisibleCount;
  }

  /**
   * Decrement the count of visible modals
   */
  decrementModalVisibleCount(): number {
    this.modalVisibleCount--;
    this.currentModalVisibleBS.next(this.modalVisibleCount);
    return this.modalVisibleCount;
  }

  /**
   * Get the current count of visible modals
   */
  getModalVisibleCount(): number {
    return this.modalVisibleCount;
  }
}
