import { Component, EventEmitter, Input, Output } from '@angular/core';

import { IconProp } from '@fortawesome/fontawesome-svg-core';

import { CloseSession, Session } from '../../../entities/session.entity';
import { User } from '../../../entities/user.entity';
import { NgxMasonryComponent } from 'ngx-masonry';

import { AuthService } from '../../../../services/auth.service';
import { MessagesService } from '../../../../services/messages.service';

@Component({
  selector: 'session-card',
  templateUrl: './session-card.component.html',
  styleUrl: './session-card.component.scss'
})
export class SessionCardComponent {
  @Input() session!: Session;
  @Input() masonry?: NgxMasonryComponent;
  @Input() loading: boolean = false;

  @Output() loadingChange = new EventEmitter<boolean>();

  @Output() onClose: EventEmitter<Session> = new EventEmitter<Session>();

  constructor(
    public auth: AuthService,
    public messages: MessagesService,
    private _closeSession: CloseSession
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

  deviceTypeIcon(deviceType: string = ''): IconProp {
    if (!deviceType || deviceType == '') return ['far', 'circle-question'];
    else if (deviceType.includes('desktop')) return ['fas', 'desktop'];
    else if (deviceType.includes('laptop')) return ['fas', 'laptop'];
    else if (deviceType.includes('tablet')) return ['fas', 'tablet'];
    else if (deviceType.includes('smartphone') || deviceType.includes('mobile')) return ['fas', 'mobile'];
    else if (deviceType.includes('smarttv') || deviceType.includes('tv')) return ['fas', 'tv'];
    else return ['far', 'circle-question'];
  }

  browserIcon(client: string = ''): IconProp {
    if (client.includes('Chrome')) return ['fab', 'chrome'];
    else if (client.includes('Firefox')) return ['fab', 'firefox'];
    else if (client.includes('Safari')) return ['fab', 'safari'];
    else if (client.includes('Opera')) return ['fab', 'opera'];
    else if (client.includes('Edge')) return ['fab', 'edge'];
    else if (client.includes('Internet Explorer')) return ['fab', 'internet-explorer'];
    else return ['fas', 'circle-question'];
  }
}
