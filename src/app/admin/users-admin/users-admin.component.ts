import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { MessageService } from 'src/app/services/message.service';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/shared/models/user.model';
import { Global } from 'src/app/shared/global/global';
import { SessionService } from 'src/app/services/session.service';
import { Observable } from 'rxjs';
import { IconName } from '@fortawesome/fontawesome-svg-core';
import { Session } from 'src/app/shared/models/session.model';

@Component({
  selector: 'app-users-admin',
  templateUrl: './users-admin.component.html',
  styleUrls: ['./users-admin.component.scss']
})
export class UsersAdminComponent implements OnInit {
  @ViewChild('message_container') messageContainer!: ElementRef;
  filter: any = Global.filter;

  usersLoading: boolean = true;
  sessionsLoading: string[] = [];
  submitLoading: string[] = [];

  users: User[] = [];
  usersPage: number = 1;
  usersPageSize: number = 10;
  usersCount: number = 0;
  usersSearch: any;

  constructor(
    public auth: AuthService,
    public router: Router,
    public message: MessageService,
    public userService: UserService,
    public sessionService: SessionService
  ) { }

  @HostListener('window:beforeunload', ['$event'])
  canDeactivate(): Observable<boolean> | boolean {
    return !this.hasChanges();
  }

  hasChanges(): boolean {
    return false;
  }

  ngOnInit(): void {
    this.getUsers();
  }

  countUsers(): void {
    this.userService.countUsers(this.usersSearch).subscribe({
      next: (data) => {
        this.usersCount = data;
      },
      error: (error) => {
        this.message.error(error, { onlyOne: true, displayMode: 'replace', target: this.messageContainer });
      }
    });
  }

  getUsers(): void {
    console.log(this.usersSearch);
    this.usersLoading = true;
    this.countUsers();
    this.userService.getUsers({
      $page: this.usersPage,
      $count: this.usersPageSize,
      ...this.usersSearch
    }).subscribe({
      next: (data) => {
        this.users = data;
      },
      error: (error) => {
        this.message.error(error, { onlyOne: true, displayMode: 'replace', target: this.messageContainer });
      }
    }).add(() => {
      this.usersLoading = false
    });
  }

  deleteUser(user: User): void {
    if (user._id) this.submitLoading.push(user._id);
    this.userService.deleteUser(user).subscribe({
      next: (data) => {
        this.getUsers();
        this.message.success('User succesfully deleted.', { onlyOne: true, displayMode: 'replace', target: this.messageContainer });
      },
      error: (error) => {
        this.message.error(error, { onlyOne: true, displayMode: 'replace', target: this.messageContainer });
      }
    }).add(() => {
      this.submitLoading = this.submitLoading.filter(id => id != user._id)
    });
  }

  getSessions(user: User): void {
    if (user._id) this.sessionsLoading.push(user._id);
    this.sessionService.getSessions({
      user: user._id,
      $sort: [['blocked', 'asc'], ['closed', 'asc'], ['updatedAt', 'desc']]
    }).subscribe({
      next: (data) => {
        (user as any).sessions = data;
      },
      error: (error) => {
        this.message.error(error, { onlyOne: true, displayMode: 'replace', target: this.messageContainer });
      }
    }).add(() => {
      this.sessionsLoading = this.sessionsLoading.filter(id => id != user._id)
    });
  }

  closeSession(session: Session, user: User): void {
    if (session._id) this.submitLoading.push(session._id);
    session.closed = true;
    this.sessionService.editSession(session).subscribe({
      next: (data) => {
        this.getSessions(user);
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
