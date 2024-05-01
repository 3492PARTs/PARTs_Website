import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { AuthService, UserData } from 'src/app/services/auth.service';
import { GeneralService } from 'src/app/services/general.service';
import { HttpClient } from '@angular/common/http';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { Alert, NotificationsService } from 'src/app/services/notifications.service';
import { ActivatedRoute } from '@angular/router';
import { User } from 'src/app/models/user.models';
import { APIService } from 'src/app/services/api.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  user: User = new User();
  editUser: User = new User();
  userProfileImage!: File | null;

  editProfileImageModalVisible = false;
  showCropper = false;
  @ViewChild('EditProfileImageModalButtonRibbon', { read: ElementRef, static: false }) editProfileImageModalButtonRibbon!: ElementRef;
  @ViewChild('EditProfileImageModalCropper', { read: ElementRef, static: false }) editProfileImageModalCropper!: ElementRef;

  imageChangedEvent: any = '';
  croppedImage: any = '';

  input: UserData = new UserData();

  alertTableCols: object[] = [
    { PropertyName: 'alert_subject', ColLabel: 'Subject' },
    { PropertyName: 'alert_body', ColLabel: 'Message' },
    { PropertyName: 'staged_time', ColLabel: 'Sent' },

  ];
  notifications: Alert[] = [];
  messages: Alert[] = [];

  alertModalVisible = false;
  activeAlert = new Alert();

  activeTab = '';

  constructor(private auth: AuthService,
    public gs: GeneralService,
    private api: APIService,
    private renderer: Renderer2,
    private ns: NotificationsService,
    private route: ActivatedRoute) {
    this.route.queryParamMap.subscribe(queryParams => {
      this.activeTab = queryParams.get('tab') || '';
    });

    this.auth.user.subscribe(u => {
      this.user = u;
      this.editUser = this.gs.cloneObject(u) as User;
      console.log(this.editUser);
    });

    this.ns.notifications.subscribe(ns => this.notifications = ns);
    this.ns.messages.subscribe(ms => this.messages = ms);
  }

  ngOnInit(): void {
  }

  saveProfile(): null | undefined | void {
    this.closeEditProfileImageModal();
    let form = new FormData();

    if (this.croppedImage) {
      const imageName = 'name.png';
      const imgStr = this.croppedImage.split(',')[1];
      const imageBlob = this.dataURItoBlob(imgStr);
      const imageFile = new File([imageBlob], imageName, { type: 'image/png' });

      form.append('image', imageFile, imageFile.name);
    }
    else if (!this.gs.strNoE(this.input.password)) {
      if (this.input.password === this.input.passwordConfirm) {
        form.append('password', this.input.password);
      } else {
        this.gs.triggerError('Passwords do not match.');
        return null;
      }
    }
    form.append('first_name', this.editUser.first_name);
    form.append('last_name', this.editUser.last_name);
    form.append('email', this.editUser.email);


    this.api.put(true, 'user/profile/', form, (result: any) => {
      this.gs.successfulResponseBanner(result);

      this.auth.getUser();
      this.userProfileImage = null;
      this.input = new UserData();
    }, (err: any) => {
      this.gs.triggerError(err);
    });
  }

  /*---- Profile Image Helpers ----*/
  fileChangeEvent(event: any): void {
    this.showCropper = true;
    this.gs.incrementOutstandingCalls();
    this.imageChangedEvent = event;
    this.adjustProfileImageEditorSize();
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64;
  }

  imageLoaded() {
    // show cropper
  }
  cropperReady() {
    // cropper ready
    this.gs.decrementOutstandingCalls();
  }

  loadImageFailed() {
    // show message
  }

  openEditProfileImageModal() {
    this.showCropper = false;
    this.editProfileImageModalVisible = true;
  }

  closeEditProfileImageModal() {
    this.editProfileImageModalVisible = false;
    this.showCropper = false;
  }

  adjustProfileImageEditorSize() {
    if (this.editProfileImageModalButtonRibbon && this.editProfileImageModalCropper) {
      const height = this.editProfileImageModalButtonRibbon.nativeElement.children[0].scrollHeight;
      const heightStr = 'calc(100vh - (1em + 2.813em + 2em + ' + height + 'px))';
      this.renderer.setStyle(
        this.editProfileImageModalCropper.nativeElement,
        'height',
        heightStr
      );
    }
  }

  dataURItoBlob(dataURI: string) {
    const byteString = window.atob(dataURI);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const int8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      int8Array[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([int8Array], { type: 'image/png' });
    return blob;
  }

  // Alerts --------------------------------------------------------------------------------
  dismissAlert(a: Alert) {
    this.ns.dismissAlert(a);
    this.alertModalVisible = false;
    this.activeAlert = new Alert();
  }

  viewAlert(a: Alert) {
    this.alertModalVisible = true;
    this.activeAlert = a;
  }
}
