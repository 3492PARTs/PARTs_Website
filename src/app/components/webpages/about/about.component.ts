import { Component, HostListener, OnInit } from '@angular/core';
import { BoxComponent } from '../../atoms/box/box.component';
import { HeaderComponent } from '../../atoms/header/header.component';
import { ModalComponent } from '../../atoms/modal/modal.component';
import { AppSize, GeneralService } from '../../../services/general.service';
import { CommonModule } from '@angular/common';
import { BlueBannerComponent } from "../../elements/blue-banner/blue-banner.component";

@Component({
  selector: 'app-about',
  imports: [BoxComponent, HeaderComponent, ModalComponent, CommonModule, BlueBannerComponent],
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
