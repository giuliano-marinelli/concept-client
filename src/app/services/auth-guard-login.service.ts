import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuardLogin implements CanActivate {

  constructor(
    private auth: AuthService,
    private router: Router
  ) { }

  canActivate(): Observable<boolean> {
    return new Observable((observer) => {
      this.auth.isLoggedIn.subscribe({
        next: (loggedUser) => {
          if (!loggedUser) this.router.navigate(['/']);
          observer.next(loggedUser ? true : false);
        }
      });
    });
  }

}
