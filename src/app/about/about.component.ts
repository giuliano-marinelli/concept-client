import { Component, OnInit } from '@angular/core';

import { AuthService } from '../services/auth.service';
import { MessagesService } from '../services/messages.service';

@Component({
  selector: 'about',
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss'
})
export class AboutComponent implements OnInit {
  JSON = JSON;

  constructor(
    public messages: MessagesService,
    public auth: AuthService
  ) {}

  ngOnInit(): void {}
}
