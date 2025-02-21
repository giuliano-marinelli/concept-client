import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { FindUsers, User } from '../../shared/entities/user.entity';
import { Global } from '../../shared/global/global';
import { Observable } from 'rxjs';

import { AuthService } from '../../services/auth.service';
import { MessagesService } from '../../services/messages.service';

@Component({
  selector: 'admin-users',
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.scss'
})
export class AdminUsersComponent implements OnInit {
  filter: any = Global.filter;

  usersLoading: boolean = true;
  submitLoading: string[] = [];

  users: User[] = [];
  usersPage: number = 1;
  usersPageSize: number = 12;
  usersCount: number = 0;
  usersSearch: any;

  constructor(
    public auth: AuthService,
    public router: Router,
    public messages: MessagesService,
    public _findUsers: FindUsers
  ) {}

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

  getUsers(): void {
    this.usersLoading = true;
    this._findUsers({ relations: { sessions: { device: true }, emails: true } })
      .fetch({
        ...this.usersSearch,
        pagination: {
          page: this.usersPage,
          count: this.usersPageSize
        }
      })
      .subscribe({
        next: ({ data, errors }: any) => {
          if (errors)
            this.messages.error(errors, {
              onlyOne: true,
              displayMode: 'replace'
            });
          if (data?.users) {
            const users = data?.users;
            this.users = users?.set;
            this.usersCount = users?.count;
          }
        }
      })
      .add(() => {
        this.usersLoading = false;
      });
  }
}
