import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { IconName, IconProp } from '@fortawesome/fontawesome-svg-core';

import { CloseSession, FindSessions, Session } from '../../shared/entities/session.entity';
import { Global } from '../../shared/global/global';

import { AuthService } from '../../services/auth.service';
import { MessagesService } from '../../services/messages.service';

@Component({
  selector: 'settings-devices',
  templateUrl: './settings-devices.component.html',
  styleUrl: './settings-devices.component.scss'
})
export class SettingsDevicesComponent implements OnInit {
  @ViewChild('message_container') messageContainer!: ElementRef;
  filter: any = Global.filter;

  sessionsLoading: boolean = true;
  submitLoading: string[] = [];

  sessions: Session[] = [];
  sessionsPage: number = 1;
  sessionsPageSize: number = 10;
  sessionsCount: number = 0;

  constructor(
    public auth: AuthService,
    public router: Router,
    public messages: MessagesService,
    private _findSessions: FindSessions
  ) {}

  ngOnInit(): void {
    this.getSessions();
  }

  getSessions(): void {
    this.sessionsLoading = true;
    this._findSessions
      .fetch({
        where: { user: { id: { eq: this.auth.user?.id } } },
        order: [{ blockedAt: 'ASC' }, { closedAt: 'ASC' }, { updatedAt: 'DESC' }]
      })
      .subscribe({
        next: ({ data, errors }: any) => {
          if (errors)
            this.messages.error(errors, {
              onlyOne: true,
              displayMode: 'replace',
              target: this.messageContainer
            });
          if (data?.sessions) {
            const sessions = data?.sessions;
            this.sessions = sessions?.set;
            this.sessionsCount = sessions?.count;
          }
        }
      })
      .add(() => {
        this.sessionsLoading = false;
      });
  }
}
