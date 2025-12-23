import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BackendService {

  private http = inject(HttpClient);
  private baseUrl = 'https://localhost:8080/api'; // TODO: globalizzarlo

  ls(path: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/ls`, {params: {path: path}});
  }

  mkdir(currName: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/mkdir`, {currName: currName});
  }

  mv(payload: any[]): Observable<any> {
    return this.http.post(`${this.baseUrl}/mv`, payload);
  }

  cp(payload: any[]): Observable<any> {
    return this.http.post(`${this.baseUrl}/cp`, payload);
  }

  rm(targets: string[]): Observable<any> {
    return this.http.delete(`${this.baseUrl}/rm`, {body: {targets: targets}});
  }

  locate(source: string, str: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/locate`, {source: source, str: str});
  }

  cat(filePath: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/cat`, {filePath: filePath}, {responseType: 'blob'});
  }

}
