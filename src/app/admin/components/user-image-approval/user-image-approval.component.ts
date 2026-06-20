import { Component, OnInit } from '@angular/core';
import { AuthCallStates, AuthService } from '@app/auth/services/auth.service';
import { User, UserImage } from '@app/auth/models/user.models';
import { APIService } from '@app/core/services/api.service';
import { cloneObject, strNoE } from '@app/core/utils/utils.functions';
import { ModalService } from '@app/core/services/modal.service';
import { BoxComponent } from '@app/shared/components/atoms/box/box.component';
import { ButtonComponent } from '@app/shared/components/atoms/button/button.component';
import { TableButtonType, TableColType, TableComponent } from '@app/shared/components/atoms/table/table.component';


@Component({
  selector: 'app-user-image-approval',
  imports: [BoxComponent, ButtonComponent, TableComponent],
  templateUrl: './user-image-approval.component.html',
  styleUrls: ['./user-image-approval.component.scss']
})
export class UserImageApprovalComponent implements OnInit {

  userImages: UserImage[] = [];
  userImageTableCols: TableColType[] = [
    { PropertyName: 'image', ColLabel: 'Image', Type: 'image', Width: '12rem' },
    { PropertyName: 'user.name', ColLabel: 'Name' },
    { PropertyName: 'user.username', ColLabel: 'Username' },
    { PropertyName: 'user.email', ColLabel: 'Email' },
    { PropertyName: 'date_added', ColLabel: 'Uploaded' },
  ];
  userImageTableButtons: TableButtonType[] = [
    new TableButtonType('check-decagram-outline', this.approveUserImage.bind(this), 'Approve Image', undefined, undefined, undefined, '', '', 'success'),
    new TableButtonType('trash-outline', this.deleteUserImage.bind(this), 'Delete Image', undefined, undefined, undefined, '', '', 'danger')
  ];

  constructor(private api: APIService, private authService: AuthService, private modalService: ModalService) { }

  ngOnInit(): void {
    this.authService.authInFlight.subscribe((r) => {
      if (r === AuthCallStates.comp) {
        this.getUnapprovedUserImages();
      }
    });
  }

  getUnapprovedUserImages(): void {
    this.api.get(true, 'user/user-images/', {
      img_approved: false
    }, (result: UserImage[]) => {
      this.userImages = result;
    }, (err: any) => {
      this.modalService.triggerError(err);
    });
  }

  approveUserImage(userImage: UserImage): void {
    const updatedUserImage = cloneObject(userImage);
    updatedUserImage.img_approved = true;

    this.saveUserImage(updatedUserImage);
  }


  deleteUserImage(userImage: UserImage): void {
    const updatedUserImage = cloneObject(userImage);
    updatedUserImage.void_ind = 'y';

    this.saveUserImage(updatedUserImage);
  }

  saveUserImage(userImage: UserImage): void {
    this.api.post(true, 'user/user-images/', userImage, (result: any) => {
      this.modalService.successfulResponseBanner(result);
      this.getUnapprovedUserImages();
    }, (err: any) => {
      this.modalService.triggerError(err);
    });
  }
}
