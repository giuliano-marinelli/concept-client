import { Component, OnInit } from '@angular/core';

import { environment } from '../../environments/environment';

import { AuthService } from '../services/auth.service';
import { MessagesService } from '../services/messages.service';

@Component({
  selector: 'about',
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss'
})
export class AboutComponent implements OnInit {
  JSON = JSON;

  graphqlUrl: string = `http://${environment.host}:${environment.appPort}/${environment.graphql}`;
  glspUrl: string = `ws://${environment.host}:${environment.glspPort}/${environment.glsp}`;

  constructor(
    public messages: MessagesService,
    public auth: AuthService
  ) {}

  ngOnInit(): void {}
}
