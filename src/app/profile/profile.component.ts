import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { User } from '../shared/models/user.model';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  userLoading: boolean = true;

  user?: User;

  //router params
  username!: string;

  constructor(
    public auth: AuthService,
    public route: ActivatedRoute,
    public router: Router,
    public titleService: Title,
    public formBuilder: UntypedFormBuilder,
    public userService: UserService,
    public changeDetector: ChangeDetectorRef
  ) {
    this.route.params.subscribe(params => {
      this.username = params['username'];
    });
  }

  ngOnInit(): void {
    if (!this.username) this.router.navigate(['']);
    this.getUser();
  }

  getUser(): void {
    this.userLoading = true;
    this.userService.getUsers({ username: this.username }).subscribe({
      next: (data) => {
        if (data[0]) {
          this.user = data[0];
          console.log(data[0]);
          if (this.user?.username) this.titleService.setTitle(this.user.username + ' (' + this.user.profile?.name + ")");
        } else {
          this.router.navigate(['not-found']);
        }
      },
      error: (error) => {
        this.router.navigate(['not-found']);
      }
    }).add(() => {
      this.userLoading = false
    });
  }

}
