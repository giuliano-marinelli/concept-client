import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

import { environment } from '../environments/environment';

import { Logout } from './shared/entities/user.entity';

import { AuthService } from './services/auth.service';
import { DarkmodeService } from './services/darkmode.service';
import { MessagesService } from './services/messages.service';
import { TitleService } from './services/title.service';

@Component({
  selector: 'root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Concept';
  currentYear = new Date().getUTCFullYear();

  isDevelopment: boolean = !environment.production;

  stretchComponents: string[] = ['^/[^/]+/model/[^/]+$', '^/[^/]+/model/new', '^/[^/]+/model/new/[^/]+$'];
  stretch = false;

  breadcrumb: { path: string; title: string }[] = [];

  constructor(
    public auth: AuthService,
    public router: Router,
    public messages: MessagesService,
    public darkmodeService: DarkmodeService,
    public titleService: TitleService,
    public _logout: Logout
  ) {}

  ngOnInit() {
    // initialize darkmode
    this.darkmodeService.initTheme();

    // for change page title
    this.titleService.appTitle = this.title;
    this.titleService.initTitle();

    // get the routes for breadcrumb
    this.titleService.breadcrumbSubject.subscribe((breadcrumb) => {
      this.breadcrumb = breadcrumb;
    });

    // get the current route and check if the navbar should be full
    this.router.events.subscribe((val) => {
      if (val instanceof NavigationEnd) {
        this.stretch = this.stretchComponents.some((routePattern) => {
          const regex = new RegExp(routePattern);
          return regex.test(this.router.url);
        });
      }
    });
  }

  logout() {
    this._logout.fetch().subscribe({
      next: ({ data, errors }) => {
        if (errors) this.messages.error(errors);
        else if (data?.logout) {
          this.auth.eraseToken();
          this.auth.setUser();
          this.messages.success('Goodbye! Hope to see you soon!');
        }
      }
    });
  }
}
