import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { UserService } from './user.service';
import { User } from '../shared/models/user.model';
import { Observable, Observer } from 'rxjs';

@Injectable()
export class AuthService {
  loggedUserChecked: boolean = false;
  loggedUserLoading: boolean = true;
  loggedUser?: User;

  isLoggedIn: Observable<User | false>;

  constructor(
    private router: Router,
    private jwtHelper: JwtHelperService,
    private userService: UserService
  ) {
    let checkLoginSubscriber = () => {
      const observers: Observer<User | false>[] = [];

      return (observer: Observer<User | false>) => {
        observers.push(observer);

        if (observers.length === 1) {
          const token = localStorage.getItem('token');
          // check if logged user is authentic by retrieving user data
          // and sending current device info
          if (!token) {
            this.loggedUserLoading = false;
            observers.forEach(obs => obs.next(false));
            this.loggedUserChecked = true;
          } else {
            this.setLoggedUser()
              .then((loggedUser) => {
                observers.forEach(obs => obs.next(loggedUser));
              })
              .catch((error) => {
                observers.forEach(obs => obs.next(false));
              })
              .finally(() => {
                observers.forEach(obs => obs.complete());
                this.loggedUserChecked = true;
              });
          }
        } else if (this.loggedUserChecked) {
          observer.next(this.loggedUser || false);
        }
      }
    }

    this.isLoggedIn = new Observable(checkLoginSubscriber());

    //this subscription is used to check at least once user data is authentic
    this.isLoggedIn.subscribe();
  }

  login(credentials: any): Promise<User> {
    return new Promise((resolve, reject) => {
      this.userService.login(credentials).subscribe({
        next: (token) => {
          localStorage.setItem('token', token);
          this.router.navigate(['/']);
          this.setLoggedUser()
            .then(loggedUser => resolve(loggedUser))
            .catch(error => reject(error));
        },
        error: error => reject(error)
      });
    });
  }

  logout(): void {
    delete this.loggedUser;
    localStorage.removeItem('token');
    this.router.navigate(['/']);
  }

  setLoggedUser(): Promise<User> {
    return new Promise((resolve, reject) => {
      const token = localStorage.getItem('token');

      if (token) {
        let decodedUser = new User();
        decodedUser._id = this.jwtHelper.decodeToken(token).id;

        this.userService.getUser(decodedUser).subscribe({
          next: (data) => {
            this.loggedUser = data;
            resolve(this.loggedUser);
          },
          error: error => {
            this.logout();
            reject(error);
          }
        }).add(() => this.loggedUserLoading = false);
      } else {
        this.logout();
        reject('No token found');
      }
    });
  }

  getToken() {
    return localStorage.getItem('token');
  }

  isAdmin(): boolean {
    return this.loggedUser?.role == 'admin';
  }

  isVerified(): boolean {
    return this.loggedUser?.verified || false;
  }
}
