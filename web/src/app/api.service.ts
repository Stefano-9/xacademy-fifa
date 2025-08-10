import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from '../environments/environment';
import { Observable } from 'rxjs';

export interface PlayersListResponse {
  page: number;
  limit: number;
  total: number;
  data: any[];
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  baseUrl(): string {
    return this.base;
  }

  private headers(): HttpHeaders | undefined {
    try {
      const hasLS = typeof localStorage !== 'undefined';
      const t = hasLS ? localStorage.getItem('token') : null;
      return t ? new HttpHeaders({ Authorization: `Bearer ${t}` }) : undefined;
    } catch {
      return undefined;
    }
  }


  login(username: string, password: string) {
    return this.http.post<{ access_token: string }>(
      `${this.base}/auth/login`,
      { username, password }
    );
  }


  players(params: {
    name?: string;
    club?: string;
    position?: string;
    page?: number;
    limit?: number;
  }): Observable<PlayersListResponse> {
    let p = new HttpParams();
    Object.entries(params || {}).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') p = p.set(k, String(v));
    });

    return this.http.get<PlayersListResponse>(`${this.base}/players`, {
      params: p,
      headers: this.headers()
    });
  }


  exportCsv(filters: { name?: string; club?: string; position?: string }): Observable<Blob> {
    let p = new HttpParams();
    Object.entries(filters || {}).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') p = p.set(k, String(v));
    });
    return this.http.get(`${this.base}/players/export.csv`, {
      params: p,
      headers: this.headers(),
      responseType: 'blob'
    });
  }


  player(id: number) {
    return this.http.get<any>(`${this.base}/players/${id}`, {
      headers: this.headers()
    });
  }

  createPlayer(payload: {
    name: string;
    club?: string;
    position?: string;
    rating?: number;
    nationality?: string;
    year?: number;
    skills?: Record<string, number>;
  }) {
    return this.http.post<any>(`${this.base}/players`, payload, {
      headers: this.headers()
    });
  }

  updatePlayer(id: number, payload: {
    club?: string;
    position?: string;
    rating?: number;
    nationality?: string;
    year?: number;
    skills?: Record<string, number>;
  }) {
    return this.http.put<any>(`${this.base}/players/${id}`, payload, {
      headers: this.headers()
    });
  }

  deletePlayer(id: number) {
    return this.http.delete<any>(`${this.base}/players/${id}`, {
      headers: this.headers()
    });
  }

 
  uploadPlayersCsv(file: File) {
    const fd = new FormData();
    fd.append('file', file, file.name);
    return this.http.post<{ imported: number; errors: string[] }>(
      `${this.base}/players/import-file`,
      fd,
      { headers: this.headers() }
    );
  }
}
