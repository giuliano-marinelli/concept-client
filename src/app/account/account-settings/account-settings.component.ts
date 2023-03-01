import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { MessageService } from 'src/app/services/message.service';
import { UserService } from 'src/app/services/user.service';
import { Observable } from 'rxjs';
import { User } from 'src/app/shared/models/user.model';
import { ExtraValidators } from 'src/app/shared/validators/validators';

@Component({
  selector: 'app-account-settings',
  templateUrl: './account-settings.component.html',
  styleUrls: ['./account-settings.component.scss']
})
export class AccountSettingsComponent implements OnInit {
  @ViewChild('message_container_update') messageContainerUpdate!: ElementRef;
  @ViewChild('message_container_delete') messageContainerDelete!: ElementRef;

  userLoading: boolean = true;
  updateSubmitLoading: boolean = false;
  deleteSubmitLoading: boolean = false;

  user?: User;

  userForm!: UntypedFormGroup;
  _id: any;
  username = new UntypedFormControl('', [
    Validators.required,
    Validators.minLength(4),
    Validators.maxLength(30),
    Validators.pattern('[a-zA-Z0-9\_\-]*')
  ], [
    ExtraValidators.usernameExists(this.userService)
  ]);
  constructor(
    public auth: AuthService,
    public router: Router,
    public formBuilder: UntypedFormBuilder,
    public userService: UserService,
    public message: MessageService
  ) { }

  @HostListener('window:beforeunload', ['$event'])
  canDeactivate(): Observable<boolean> | boolean {
    return !this.hasChanges();
  }

  hasChanges(): boolean {
    return this.userForm.dirty;
  }

  ngOnInit(): void {
    this.userForm = this.formBuilder.group({
      _id: this._id,
      username: this.username
    });
    this.getUser();
  }

  setValid(control: UntypedFormControl): object {
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
          this.userForm.patchValue(data);
        },
        error: (error) => {
          this.message.error(error, { onlyOne: true, displayMode: 'replace', target: this.messageContainerUpdate });
        }
      }).add(() => {
        this.userLoading = false
      });
    } else {
      this.router.navigate(['/']);
    }
  }

  updateUser(): void {
    this.userForm.markAllAsTouched();
    if (this.userForm.valid) {
      this.updateSubmitLoading = true;
      this.userService.editUser(this.userForm.value).subscribe({
        next: (data) => {
          this.getUser();
          this.auth.setLoggedUser();
          this.userForm.markAsPristine();
          this.message.success('Username succesfully changed.', { onlyOne: true, displayMode: 'replace', target: this.messageContainerUpdate });
        },
        error: (error) => {
          this.message.error(error, { onlyOne: true, displayMode: 'replace', target: this.messageContainerUpdate });
        },
      }).add(() => {
        this.updateSubmitLoading = false;
      });
    } else {
      this.message.error('Some values are invalid, please check.', { onlyOne: true, displayMode: 'replace', target: this.messageContainerUpdate });
    }
  }

  deleteUser(): void {
    this.deleteSubmitLoading = true;
    // if (this.auth.loggedUser) {
    //   this.userService.deleteUser(this.auth.loggedUser).subscribe({
    //     next: (data) => {
    //       this.message.warning('Your account was succesfully deleted. We will miss you!');
    //     },
    //     error: (error) => {
    //       this.message.error(error, { onlyOne: true, displayMode: 'replace', target: this.messageContainerDelete });
    //     }
    //   }).add(() => {
    //     this.deleteSubmitLoading = false
    //   });
    // } else {
    //   this.router.navigate(['/']);
    // }
  }

}
