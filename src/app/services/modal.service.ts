import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ModalService {

  /* Modal Visible */
  private modalVisible = new BehaviorSubject<boolean>(false);
  currentModalVisible = this.modalVisible.asObservable();

  private modalVisibleCount = 0;

  constructor() { }

  setModalVisible(): void {
    this.modalVisible.next(this.modalVisibleCount > 0);
  }

  incrementModalVisibleCount(): void {
    this.modalVisibleCount++;
    this.setModalVisible();
  }

  decrementModalVisibleCount(): void {
    if (this.modalVisibleCount > 0) this.modalVisibleCount--;
    this.setModalVisible();
  }
}
