import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService, PlayersListResponse } from '../api.service';
import { Subject, Subscription, of } from 'rxjs';
import { switchMap, tap, catchError } from 'rxjs/operators';

type ListParams = {
  name?: string;
  club?: string;
  position?: string;
  page: number;
  limit: number;
};

@Component({
  selector: 'app-players-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './players-list.component.html'
})
export class PlayersListComponent implements OnInit, OnDestroy {
  list: any[] = [];


  name = '';
  club = '';
  position = '';


  page = 1;
  limit = 10;
  total = 0;
  totalPages = 1;

 
  loading = false;
  error = '';

  
  selectedFile?: File;
  importInfo: { imported: number; errors: string[] } | null = null;

 
  private load$ = new Subject<ListParams>();
  private sub?: Subscription;

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit() {
    this.sub = this.load$
      .pipe(
        tap(() => { this.loading = true; this.error = ''; }),
        switchMap((params) =>
          this.api.players(params).pipe(
            catchError((err) => {
              this.error = this.formatErr(err);
              const empty: PlayersListResponse = {
                page: params.page,
                limit: params.limit,
                total: 0,
                data: []
              };
              return of(empty);
            })
          )
        ),
        tap((res) => {
          this.list = Array.isArray(res?.data) ? res.data : [];
          this.total = Number(res?.total ?? 0);
          this.page = Number(res?.page ?? this.page);
          this.limit = Number(res?.limit ?? this.limit);
          this.totalPages = Math.max(1, Math.ceil(this.total / Math.max(1, this.limit)));
          this.loading = false;
        })
      )
      .subscribe();

    
    this.triggerLoad();
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

 
  private triggerLoad() {
    this.load$.next({
      name: this.name || undefined,
      club: this.club || undefined,
      position: this.position || undefined,
      page: this.page,
      limit: this.limit,
    });
  }

  private formatErr(err: any): string {
    try {
      if (err?.error?.message) {
        return Array.isArray(err.error.message)
          ? err.error.message.join(', ')
          : String(err.error.message);
      }
      if (err?.message) return String(err.message);
      return JSON.stringify(err);
    } catch {
      return 'Error desconocido';
    }
  }


  search() {
    if (this.loading) return;
    this.page = 1;
    this.triggerLoad();
  }


  goTo(p: number) {
    if (!Number.isFinite(p)) return;
    if (p < 1 || p > this.totalPages) return;
    if (p === this.page) return;
    this.page = p;
    this.triggerLoad();
  }

  changePageSize(newLimit: number | string) {
    const n = Number(newLimit);
    if (!Number.isFinite(n) || n <= 0) return;
    if (n === this.limit) return;
    this.limit = n;
    this.page = 1;
    this.triggerLoad();
  }

  pageWindow(): number[] {
    const windowSize = 5;
    const half = Math.floor(windowSize / 2);
    const start = Math.max(1, this.page - half);
    const end = Math.min(this.totalPages, start + windowSize - 1);
    const realStart = Math.max(1, end - windowSize + 1);
    const out: number[] = [];
    for (let i = realStart; i <= end; i++) out.push(i);
    return out;
  }

  showingFrom() {
    if (this.total === 0) return 0;
    return (this.page - 1) * this.limit + 1;
  }
  showingTo() {
    return Math.min(this.page * this.limit, this.total);
  }


  async exportCsv() {
    if (this.loading) return;
    this.loading = true;
    this.error = '';
    try {
      const hasLS = typeof localStorage !== 'undefined';
      const token = hasLS ? localStorage.getItem('token') : null;
      const q = new URLSearchParams();
      if (this.name) q.set('name', this.name);
      if (this.club) q.set('club', this.club);
      if (this.position) q.set('position', this.position);

      const url = `${this.api.baseUrl()}/players/export.csv${q.toString() ? `?${q.toString()}` : ''}`;
      const resp = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (!resp.ok) {
        const text = await resp.text().catch(() => '');
        throw new Error(text || `HTTP ${resp.status}`);
      }
      const blob = await resp.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = 'players.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (e: any) {
      this.error = `Error al exportar: ${e?.message || String(e)}`;
    } finally {
      this.loading = false;
    }
  }


  onFileChange(ev: Event) {
    const input = ev.target as HTMLInputElement;
    this.selectedFile = input?.files?.[0] || undefined;
  }

  onUpload() {
    if (!this.selectedFile || this.loading) return;
    this.loading = true;
    this.error = '';
    this.importInfo = null;

    this.api.uploadPlayersCsv(this.selectedFile)
      .pipe(
        catchError((err) => {
          this.error = `Error al importar: ${this.formatErr(err)}`;
          this.loading = false;
          return of({ imported: 0, errors: [this.error] });
        })
      )
      .subscribe((res: any) => {
        this.importInfo = res;
        this.loading = false;
        this.search(); 
      });
  }


  delete(id: number) {
    if (!confirm('¿Eliminar jugador?')) return;
    if (this.loading) return;
    this.loading = true;
    this.error = '';
    this.api.deletePlayer(id)
      .pipe(
        catchError((err) => {
          this.error = this.formatErr(err);
          this.loading = false;
          return of(null);
        })
      )
      .subscribe((ok) => {
        if (ok) this.triggerLoad();
      });
  }


  logout() {
    try { if (typeof localStorage !== 'undefined') localStorage.removeItem('token'); } catch {}
    this.router.navigate(['/login']);
  }
}
