import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ModalService {

  /* Modal Visible */
  private modalVisible = new BehaviorSubject<boolean>(false);
  currentModalVisible = this.modalVisible.asObservable();
  //private modalVisible = false;

  constructor() { }

  setModalVisible(b: boolean): void {
    this.modalVisible.next(b);
  }
}
