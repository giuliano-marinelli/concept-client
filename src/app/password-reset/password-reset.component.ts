import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { MessageService } from '../services/message.service';

@Component({
  selector: 'app-password-reset',
  templateUrl: './password-reset.component.html',
  styleUrls: ['./password-reset.component.scss']
})
export class PasswordResetComponent implements OnInit {

  passwordResetForm!: FormGroup;
  email = new FormControl('', [
    Validators.required,
    Validators.maxLength(100),
    Validators.email
  ]);

  constructor(
    public auth: AuthService,
    public router: Router,
    public formBuilder: FormBuilder,
    public userService: UserService,
    public message: MessageService
  ) { }

  ngOnInit(): void {
    this.auth.isLoggedIn.subscribe({
      next: (loggedUser) => {
        if (loggedUser) this.router.navigate(['/'])
      }
    });

    this.passwordResetForm = this.formBuilder.group({
      email: this.email,
    });
  }

  setValid(control: FormControl): object {
    return {
      'is-invalid': control.touched && !control.valid,
      'is-valid': control.touched && control.valid
    };
  }

  sendPasswordResetEmail(): void {
    this.passwordResetForm.markAllAsTouched();
    if (this.passwordResetForm.valid) {
      this.userService.forgotPassword(this.email.value).subscribe({
        next: (data) => {
          this.message.info("A reset password email has been sent, please check your inbox and SPAM.");
        },
        error: (error) => {
          this.message.error(error);
        }
      });
    } else {
      this.message.error('Some values are invalid, please check.');
    }
  }

}
