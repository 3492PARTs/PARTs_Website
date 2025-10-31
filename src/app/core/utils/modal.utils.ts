import { BehaviorSubject } from 'rxjs';
import { Banner } from '../models/api.models';
import { Utils } from './utils';

/**
 * ModalUtils - Utility class for managing modal dialogs, errors, and confirmations
 * This replaces the modal-related functionality previously in GeneralService
 */
export class ModalUtils {
  /* Error Modal State */
  private static showErrorModalBS = new BehaviorSubject<boolean>(false);
  static showErrorModal$ = ModalUtils.showErrorModalBS.asObservable();
  private static errorMessageBS = new BehaviorSubject<string>('');
  static errorMessage$ = ModalUtils.errorMessageBS.asObservable();
  static errorButtonText = 'OK';

  /* Confirm Modal State */
  private static showConfirmModalBS = new BehaviorSubject<boolean>(false);
  static showConfirmModal$ = ModalUtils.showConfirmModalBS.asObservable();
  private static confirmMessageBS = new BehaviorSubject<string>('');
  static confirmMessage$ = ModalUtils.confirmMessageBS.asObservable();
  static confirmButtonText = 'OK';
  static confirmButtonCancelText = 'NO';

  private static confirmFx: (() => void) | undefined | null;
  private static rejectConfirmFx: (() => void) | undefined | null;

  /**
   * Get current error modal visibility state
   */
  static get showErrorModal(): boolean {
    return ModalUtils.showErrorModalBS.value;
  }

  /**
   * Get current error message
   */
  static get errorMessage(): string {
    return ModalUtils.errorMessageBS.value;
  }

  /**
   * Get current confirm modal visibility state
   */
  static get showConfirmModal(): boolean {
    return ModalUtils.showConfirmModalBS.value;
  }

  /**
   * Get current confirm message
   */
  static get confirmMessage(): string {
    return ModalUtils.confirmMessageBS.value;
  }

  /**
   * Accept and close error modal
   */
  static acceptError(): void {
    ModalUtils.showErrorModalBS.next(false);
    ModalUtils.errorMessageBS.next('');
  }

  /**
   * Trigger an error modal with a message
   */
  static triggerError(message: any): void {
    ModalUtils.showErrorModalBS.next(true);

    if ('message' in message && message.message) {
      ModalUtils.errorMessageBS.next(message.message);
    }
    else if ('retMessage' in message && message.retMessage) {
      ModalUtils.errorMessageBS.next(message.retMessage);
    }
    else {
      ModalUtils.errorMessageBS.next(message);
    }
  }

  /**
   * Trigger a confirmation modal
   */
  static triggerConfirm(message: string, tmpConfirmFx: () => void, tmpRejectConfirmFx?: () => void): void {
    ModalUtils.confirmMessageBS.next('');
    ModalUtils.confirmFx = null;
    ModalUtils.rejectConfirmFx = null;

    ModalUtils.showConfirmModalBS.next(true);
    ModalUtils.confirmMessageBS.next(message);

    ModalUtils.confirmFx = tmpConfirmFx;
    ModalUtils.rejectConfirmFx = tmpRejectConfirmFx;
  }

  /**
   * Accept confirmation and execute callback
   */
  static acceptConfirm(): void {
    ModalUtils.showConfirmModalBS.next(false);
    if (ModalUtils.confirmFx) ModalUtils.confirmFx();
  }

  /**
   * Reject confirmation and execute callback
   */
  static rejectConfirm(): void {
    ModalUtils.showConfirmModalBS.next(false);
    if (ModalUtils.rejectConfirmFx) ModalUtils.rejectConfirmFx();
  }

  /**
   * Check API response and show banner if error
   * @param response The API response to check
   * @param addBannerFn Function to add a banner (from GeneralService)
   * @returns true if response is valid, false if error
   */
  static checkResponse(response: any, addBannerFn: (b: Banner) => void): boolean {
    const retMessage = response as { retMessage?: string; error?: boolean; errorMessage?: string };
    if (retMessage.retMessage && retMessage.error) {
      const message = retMessage.errorMessage 
        ? Utils.objectToString(JSON.parse(retMessage.errorMessage)) 
        : retMessage.retMessage;
      addBannerFn(new Banner(0, message, 5000));
      return false;
    }
    return true;
  }

  /**
   * Show success banner from API response
   * @param response The API response
   * @param addBannerFn Function to add a banner (from GeneralService)
   */
  static successfulResponseBanner(response: any, addBannerFn: (b: Banner) => void): void {
    const message = (response as { retMessage?: string }).retMessage;
    if (!Utils.strNoE(message)) {
      addBannerFn(new Banner(0, message!, 3500));
    }
  }

  /**
   * Trigger form validation banner
   * @param invalidFields Array of invalid field names
   * @param addBannerFn Function to add a banner (from GeneralService)
   */
  static triggerFormValidationBanner(invalidFields: string[], addBannerFn: (b: Banner) => void): void {
    let ret = '';
    invalidFields.forEach(s => {
      ret += `&bull;  ${s} is invalid\n`;
    });

    addBannerFn(new Banner(0, ret, 3500));
  }

  /**
   * Handle HTTP error and show error modal
   * @param error The HTTP error
   * @param decrementCallsFn Function to decrement outstanding calls (from GeneralService)
   */
  static handleHTTPError(error: any, decrementCallsFn?: () => void): void {
    let errorText = '';

    if (typeof (error.error) === 'object') {
      for (let [key, value] of Object.entries(error.error)) {
        errorText += value + '\n';
      }
    }
    else {
      errorText = error.statusText;
    }

    ModalUtils.triggerError(errorText);
    if (decrementCallsFn) decrementCallsFn();
  }
}
