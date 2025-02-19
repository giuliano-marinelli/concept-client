import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';

import { filter, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TitleService {
  appTitle: string = 'Concept';
  appSeparator: string = ' · ';
  subTitleSeparator: string = ' / ';

  titles: any[] = [];
  params: { [key: string]: string } = {};

  constructor(
    public router: Router,
    public titleService: Title
  ) {}

  initTitle(): void {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        map(() => {
          let route: ActivatedRoute = this.router.routerState.root;
          const titles: any[] = [];

          // add the titles of the route tree nodes
          while (route?.firstChild) {
            route = route.firstChild;
            // add the title of the route
            if (route.snapshot.data['title']) titles.push(route.snapshot.data['title']);
          }

          return titles;
        })
      )
      .subscribe((titles: any[]) => {
        this.titles = titles;
        this.updateTitle();
      });
  }

  updateTitle(): void {
    let title: string = '';

    // process the title if it is a function call it with params else use it as is
    this.titles.forEach((t: any, i: number) => {
      title += typeof t === 'function' ? t(this.params) : t;

      // add the separator if it is not the last title
      if (i < this.titles.length - 1) title += this.subTitleSeparator;
    });

    // set the final title
    this.titleService.setTitle(title + this.appSeparator + this.appTitle);
  }

  setParam(key: string, value: string): void {
    this.params[key] = value;
    this.updateTitle();
  }
}
