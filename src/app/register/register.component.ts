import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, AbstractControl, ValidatorFn, AsyncValidatorFn } from '@angular/forms';
import { UserService } from '../services/user.service';
import { MessageService } from '../services/message.service';
import { AuthService } from '../services/auth.service';
import { User } from '../shared/models/user.model';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { CustomValidators } from 'ngx-custom-validators';
import { ExtraValidators } from '../shared/validators/validators';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html'
})
export class RegisterComponent implements OnInit {
  @ViewChild('message_container') messageContainer!: ElementRef;

  submitLoading: boolean = false;
  emailCheckingLoading: boolean = false;
  usernameCheckingLoading: boolean = false;

  registerForm!: FormGroup;
  username = new FormControl('', [
    Validators.required,
    Validators.minLength(4),
    Validators.maxLength(30),
    Validators.pattern('[a-zA-Z0-9\_\-]*')
  ], [
    ExtraValidators.usernameExists(this.userService)
  ]);
  email = new FormControl('', [
    Validators.required,
    Validators.maxLength(100),
    Validators.email
  ], [
    ExtraValidators.emailExists(this.userService)
  ]);
  password = new FormControl('', [
    Validators.required,
    Validators.minLength(6),
    Validators.maxLength(30)
  ]);
  confirmPassword = new FormControl('', [
    Validators.required,
    Validators.minLength(6),
    Validators.maxLength(30),
    CustomValidators.equalTo(this.password)
  ]);
  role = new FormControl('', [
    Validators.required
  ]);

  constructor(
    public auth: AuthService,
    public router: Router,
    public formBuilder: FormBuilder,
    public userService: UserService,
    public message: MessageService
  ) { }

  @HostListener('window:beforeunload', ['$event'])
  canDeactivate(): Observable<boolean> | boolean {
    return !this.hasChanges();
  }

  hasChanges(): boolean {
    return this.registerForm.dirty;
  }

  ngOnInit(): void {
    this.auth.isLoggedIn.subscribe({
      next: (loggedUser) => {
        if (loggedUser) this.router.navigate(['/'])
      }
    });

    this.registerForm = this.formBuilder.group({
      username: this.username,
      email: this.email,
      password: this.password,
      confirmPassword: this.confirmPassword,
      role: 'user'//this.role
    });
  }

  setValid(control: FormControl): object {
    return {
      'is-invalid': control.dirty && !control.valid,
      'is-valid': control.dirty && control.valid
    };
  }

  register(): void {
    this.registerForm.markAllAsTouched();
    if (this.registerForm.valid) {
      this.submitLoading = true;
      this.userService.register(this.registerForm.value).subscribe({
        next: (data) => {
          this.registerForm.markAsPristine();
          this.auth.login(this.registerForm.value).then(loggedUser => this.sendVerificationEmail(data));
          this.message.success('You successfully registered.');
        },
        error: (error) => {
          this.message.error(error, { close: false, onlyOne: true, displayMode: 'replace', target: this.messageContainer });
        },
      }).add(() => {
        this.submitLoading = false;
      });
    } else {
      this.message.error('Some values are invalid, please check.', { close: false, onlyOne: true, displayMode: 'replace', target: this.messageContainer });
    }
  }

  sendVerificationEmail(user: User): void {
    this.userService.verificationUser(user).subscribe({
      next: (data) => {
        this.message.info("A verification email has been sent, please check your inbox and SPAM.", { timeout: 0 });
      },
      error: (error) => {
        this.message.error(error);
      }
    });
  }
}
