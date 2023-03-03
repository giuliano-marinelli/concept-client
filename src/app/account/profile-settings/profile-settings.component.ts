import { ChangeDetectorRef, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { MessageService } from 'src/app/services/message.service';
import { UserService } from 'src/app/services/user.service';
import { CustomValidators } from '@narik/custom-validators';
import { createMask } from '@ngneat/input-mask';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { base64ToFile } from 'ngx-image-cropper';
import { Observable } from 'rxjs';
import { User } from 'src/app/shared/models/user.model';

@Component({
  selector: 'app-profile-settings',
  templateUrl: './profile-settings.component.html',
  styleUrls: ['./profile-settings.component.scss']
})
export class ProfileSettingsComponent implements OnInit {
  @ViewChild('message_container') messageContainer!: ElementRef;
  @ViewChild("avatar_img") avatarImage!: ElementRef;

  userLoading: boolean = true;
  submitLoading: boolean = false;

  user?: User;

  profileForm!: FormGroup;
  _id: any;
  name = new FormControl('', [
    Validators.minLength(0),
    Validators.maxLength(30),
    Validators.pattern('[a-zA-Z0-9\\s]*')
  ]);
  bio = new FormControl('', [
    Validators.minLength(0),
    Validators.maxLength(200),
    // Validators.pattern('[a-zA-Z0-9,;\.\/_-\\s]*')
  ]);
  url = new FormControl('', [
    Validators.minLength(0),
    Validators.maxLength(200),
    CustomValidators.url
    // Validators.pattern('[a-zA-Z0-9,;\.\/_-\\s]*')
  ]);
  urlMask = createMask({ alias: 'url' });
  location = new FormControl('', [
    Validators.minLength(0),
    Validators.maxLength(30),
    Validators.pattern('[a-zA-Z0-9,\\s]*')
  ]);
  avatar = new FormControl('', []);
  avatarFile = new FormControl('', []);
  avatarChangedEvent!: Event;

  constructor(
    public auth: AuthService,
    public router: Router,
    public formBuilder: FormBuilder,
    public userService: UserService,
    public message: MessageService,
    private modalService: NgbModal
    // private changeDetector: ChangeDetectorRef
  ) { }

  @HostListener('window:beforeunload', ['$event'])
  canDeactivate(): Observable<boolean> | boolean {
    return !this.hasChanges();
  }

  hasChanges(): boolean {
    return this.profileForm.dirty;
  }

  ngOnInit(): void {
    this.profileForm = this.formBuilder.group({
      _id: this._id,
      avatar: this.avatar,
      avatarFile: this.avatarFile,
      profile: this.formBuilder.group({
        name: this.name,
        bio: this.bio,
        url: this.url,
        location: this.location
      }),
    });
    this.getUser();
  }

  setValid(control: FormControl): object {
    return {
      'is-invalid': control.dirty && !control.valid,
      'is-valid': control.dirty && control.valid
    };
  }

  getUser(): void {
    this.userLoading = true;
    if (this.auth.loggedUser) {
      this.userService.getUser(this.auth.loggedUser).subscribe({
        next: (data) => {
          this.user = data;
          this.profileForm.patchValue(data);
        },
        error: (error) => {
          this.message.error(error, { onlyOne: true, displayMode: 'replace', target: this.messageContainer });
        }
      }).add(() => {
        this.userLoading = false
      });
    } else {
      this.router.navigate(['/']);
    }
  }

  update(): void {
    this.profileForm.markAllAsTouched();
    if (this.profileForm.valid) {
      this.submitLoading = true;
      this.userService.editUser(this.profileForm.value).subscribe({
        next: (data) => {
          this.getUser();
          this.auth.setLoggedUser();
          this.profileForm.markAsPristine();
          this.message.success('Profile settings succesfully saved.', { onlyOne: true, displayMode: 'replace', target: this.messageContainer });
        },
        error: (error) => {
          this.message.error(error, { onlyOne: true, displayMode: 'replace', target: this.messageContainer });
        },
      }).add(() => {
        this.submitLoading = false;
      });
    } else {
      this.message.error('Some values are invalid, please check.', { onlyOne: true, displayMode: 'replace', target: this.messageContainer });
    }
  }

  onChangeAvatar(event: any, cropModal: any): void {
    if (event.target.files[0]) {
      this.modalService.open(cropModal, { centered: true });
      this.avatarChangedEvent = event;
    }
  }

  onCroppedAvatar(event: any): void {
    // this.avatarFile.setValue(base64ToFile(event.base64));
    this.avatarFile.setValue(event.base64);
    this.avatarFile.markAsDirty();
    this.avatarImage.nativeElement.src = event.base64;
  }

  // onChangeAvatar(event: Event): void {
  //   let files = (event.target as HTMLInputElement).files;
  //   const reader = new FileReader();
  //   if (files && files.length) {
  //     const file = files[0];
  //     new Compressor(file, {
  //       quality: 0.2,
  //       mimeType: 'jpg',
  //       convertSize: 1000000,
  //       success: (compressedFile) => {
  //         this.profileForm.patchValue({
  //           avatarFile: compressedFile
  //         });
  //         reader.readAsDataURL(compressedFile);
  //         reader.onload = () => {
  //           //here the file can be showed (base 64 is on reader.result)
  //           this.avatarImage.nativeElement.src = reader.result;
  //           //need to run change detector since file load runs outside of zone
  //           this.changeDetector.markForCheck();
  //         };
  //       }
  //     });
  //   }
  // }

}
