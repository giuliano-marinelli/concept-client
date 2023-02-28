import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../shared/models/user.model';
import { Global } from '../shared/global/global';

@Injectable()
export class UserService {

  constructor(private http: HttpClient) { }

  register(user: User): Observable<User> {
    return this.http.post<User>('/api/user', user);
  }

  login(credentials: any): Observable<any> {
    return this.http.post('/api/login', credentials);
  }

  getUsers(params?: any): Observable<User[]> {
    return this.http.post<User[]>('/api/users', params);
  }

  countUsers(params?: any): Observable<number> {
    return this.http.post<number>('/api/users/count', params);
  }

  addUser(user: User): Observable<User> {
    return this.http.post<User>('/api/user', Global.createFormData(user));
  }

  getUser(user: User): Observable<User> {
    return this.http.get<User>(`/api/user/${user._id}`);
  }

  getUserByUsername(username: string): Observable<User> {
    return this.http.get<User>(`/api/user/username/${username}`);
  }

  getUserByEmail(email: string): Observable<User> {
    return this.http.get<User>(`/api/user/email/${email}`);
  }

  editUser(user: User): Observable<any> {
    return this.http.post(`/api/user/${user._id}`, Global.createFormData(user), { responseType: 'text' });
  }

  deleteUser(user: User): Observable<any> {
    return this.http.delete(`/api/user/${user._id}`, { responseType: 'text' });
  }

  verificationUser(user: User): Observable<any> {
    return this.http.get(`/api/user/verification/${user._id}`, { responseType: 'text' });
  }

  verifyUser(user: string, code: string): Observable<any> {
    return this.http.get(`/api/user/verify/${user}/${code}`, { responseType: 'text' });
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.get(`/api/user/forgot/${email}`, { responseType: 'text' });
  }

}
