import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IconName } from '@fortawesome/fontawesome-svg-core';
import { AuthService } from 'src/app/services/auth.service';
import { MessageService } from 'src/app/services/message.service';
import { SessionService } from 'src/app/services/session.service';
import { Session } from 'src/app/shared/models/session.model';
import { Global } from 'src/app/shared/global/global';

@Component({
  selector: 'app-devices-settings',
  templateUrl: './devices-settings.component.html',
  styleUrls: ['./devices-settings.component.scss']
})
export class DevicesSettingsComponent implements OnInit {
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
    public message: MessageService,
    public sessionService: SessionService
  ) { }

  ngOnInit(): void {
    this.getSessions();
  }

  countSessions(): void {
    this.sessionService.countSessions().subscribe({
      next: (data) => {
        this.sessionsCount = data;
      },
      error: (error) => {
        this.message.error(error, { onlyOne: true, displayMode: 'replace', target: this.messageContainer });
      }
    });
  }

  getSessions(): void {
    this.sessionsLoading = true;
    this.countSessions();
    this.sessionService.getSessions({
      $sort: [['blocked', 'asc'], ['closed', 'asc'], ['updatedAt', 'desc']]
    }).subscribe({
      next: (data) => {
        this.sessions = data;
      },
      error: (error) => {
        this.message.error(error, { onlyOne: true, displayMode: 'replace', target: this.messageContainer });
      }
    }).add(() => {
      this.sessionsLoading = false
    });
  }

  closeSession(session: Session): void {
    if (session._id) this.submitLoading.push(session._id);
    session.closed = true;
    this.sessionService.editSession(session).subscribe({
      next: (data) => {
        this.getSessions();
        this.message.success('Session succesfully closed.', { onlyOne: true, displayMode: 'replace', target: this.messageContainer });
      },
      error: (error) => {
        this.message.error(error, { onlyOne: true, displayMode: 'replace', target: this.messageContainer });
      }
    }).add(() => {
      this.submitLoading = this.submitLoading.filter(id => id != session._id)
    });
  }

  browserIcon(client: string = ''): IconName {
    if (client.includes('Chrome')) return 'chrome';
    else if (client.includes('Firefox')) return 'firefox';
    else if (client.includes('Safari')) return 'safari';
    // else if (client.includes('Opera')) return 'opera';
    else if (client.includes('Edge')) return 'edge';
    else if (client.includes('Internet Explorer')) return 'internet-explorer';
    else return 'circle-question';
  }

}
