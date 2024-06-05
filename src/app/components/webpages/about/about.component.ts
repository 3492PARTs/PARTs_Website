import { Component, HostListener, OnInit } from '@angular/core';
import { AppSize, GeneralService } from 'src/app/services/general.service';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {

  bot2011ModalVisible = false;
  bot2012ModalVisible = false;
  bot2013ModalVisible = false;
  bot2014ModalVisible = false;
  bot2015ModalVisible = false;
  bot2016ModalVisible = false;
  bot2017ModalVisible = false;
  bot2018ModalVisible = false;
  bot2019ModalVisible = false;
  bot2020ModalVisible = false;
  bot2022ModalVisible = false;
  bot2023ModalVisible = false;
  bot2024ModalVisible = false;

  screenSize!: AppSize;
  screenSizeSmall = AppSize.SM;

  constructor(private gs: GeneralService) { }

  ngOnInit() {
    this.setScreenSize();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.setScreenSize();
  }

  private setScreenSize(): void {
    this.screenSize = this.gs.getScreenSize();
  }
}
