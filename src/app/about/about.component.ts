import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { MessageService } from '../services/message.service';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {

  JSON = JSON;

  constructor(
    public message: MessageService,
    public auth: AuthService
  ) { }

  ngOnInit(): void {
  }

}
