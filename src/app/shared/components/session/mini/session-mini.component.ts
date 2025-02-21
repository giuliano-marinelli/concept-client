import { Component, EventEmitter, Input, Output } from '@angular/core';

import { IconName } from '@fortawesome/fontawesome-svg-core';

import { CloseSession, Session } from '../../../entities/session.entity';
import { User } from '../../../entities/user.entity';

import { AuthService } from '../../../../services/auth.service';
import { MessagesService } from '../../../../services/messages.service';

@Component({
  selector: 'session-mini',
  templateUrl: './session-mini.component.html',
  styleUrl: './session-mini.component.scss'
})
export class SessionMiniComponent {
  @Input() session!: Session;
  @Input() loading: boolean = false;

  @Output() loadingChange = new EventEmitter<boolean>();

  @Output() onClose: EventEmitter<Session> = new EventEmitter<Session>();

  constructor(
    public auth: AuthService,
    public messages: MessagesService,
    public _closeSession: CloseSession
  ) {}

  closeSession(session: Session): void {
    if (!session) return;

    this.loading = true;
    this.loadingChange.emit(this.loading);

    this._closeSession
      .mutate({ id: session.id })
      .subscribe({
        next: ({ data, errors }) => {
          if (errors)
            this.messages.error(errors, {
              close: false,
              onlyOne: true,
              displayMode: 'replace'
            });
          if (data?.closeSession) {
            this.messages.success('Session successfully closed.', {
              onlyOne: true,
              displayMode: 'replace'
            });
            this.onClose.emit(data?.closeSession);
          }
        }
      })
      .add(() => {
        this.loading = false;
        this.loadingChange.emit(this.loading);
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
