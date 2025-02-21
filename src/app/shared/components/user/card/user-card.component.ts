import { Component, EventEmitter, Input, Output } from '@angular/core';

import { Session } from '../../../entities/session.entity';
import { DeleteUser, User } from '../../../entities/user.entity';
import { NgxMasonryComponent } from 'ngx-masonry';

import { AuthService } from '../../../../services/auth.service';
import { MessagesService } from '../../../../services/messages.service';

@Component({
  selector: 'user-card',
  templateUrl: './user-card.component.html',
  styleUrl: './user-card.component.scss'
})
export class UserCardComponent {
  @Input() user!: User;
  @Input() masonry?: NgxMasonryComponent;
  @Input() loading: boolean = false;

  @Output() loadingChange = new EventEmitter<boolean>();
  @Output() onDelete: EventEmitter<string> = new EventEmitter<string>();
  @Output() onSessionClose: EventEmitter<Session> = new EventEmitter<Session>();

  constructor(
    public auth: AuthService,
    public messages: MessagesService,
    private _deleteUser: DeleteUser
  ) {}

  deleteUser({ password, verificationCode }: any, user: User): void {
    if (!user) return;

    this.loading = true;
    this.loadingChange.emit(this.loading);

    this._deleteUser
      .mutate({ id: user.id, password: password })
      .subscribe({
        next: ({ data, errors }) => {
          if (errors) {
            this.messages.error(errors, {
              onlyOne: true,
              displayMode: 'replace'
            });
          }
          if (data?.deleteUser) {
            this.messages.success('User successfully deleted.', {
              onlyOne: true,
              displayMode: 'replace'
            });
            this.onDelete.emit(data?.deleteUser);
          }
        }
      })
      .add(() => {
        this.loading = false;
        this.loadingChange.emit(this.loading);
      });
  }
}
