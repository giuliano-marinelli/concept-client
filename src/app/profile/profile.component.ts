import { ChangeDetectorRef, Component, OnDestroy, OnInit, effect } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';
import { ProfileService } from '../services/profile.service';
import { TitleService } from '../services/title.service';

@Component({
  selector: 'profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit, OnDestroy {
  //router params
  username!: string;

  constructor(
    public auth: AuthService,
    public route: ActivatedRoute,
    public router: Router,
    public titleService: TitleService,
    public changeDetector: ChangeDetectorRef,
    public profile: ProfileService
  ) {
    effect(() => {
      const user = this.profile.user();
      if (user) {
        if (user.username) this.titleService.setParam('username', user.username);
        if (user.profile?.name) this.titleService.setParam('profilename', user.profile.name);
      }
    });
  }

  async ngOnInit(): Promise<void> {
    this.route.params.subscribe(async (params) => {
      this.username = params['username'];

      if (!this.username) this.router.navigate(['/']);
      try {
        await this.profile.fetchUser(this.username);
      } catch (error) {
        this.router.navigate(['not-found']);
      }
    });
  }

  ngOnDestroy(): void {
    this.profile.reset();
  }
}
