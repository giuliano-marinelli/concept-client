import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Session } from '../shared/models/session.model';
import { Global } from '../shared/global/global';

@Injectable()
export class SessionService {

  constructor(private http: HttpClient) { }

  getSessions(params?: any): Observable<Session[]> {
    return this.http.post<Session[]>('/api/sessions', params);
  }

  countSessions(params?: any): Observable<number> {
    return this.http.post<number>('/api/sessions/count', params);
  }

  editSession(session: Session): Observable<any> {
    return this.http.post(`/api/session/${session._id}`, Global.createFormData(session), { responseType: 'text' });
  }

}
