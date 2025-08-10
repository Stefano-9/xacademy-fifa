import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { PlayersListComponent } from './players-list/players-list.component';
import { PlayerDetailComponent } from './player-detail/player-detail.component';
import { PlayerFormComponent } from './player-form/player-form.component';
import { AuthGuard } from './auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'players', component: PlayersListComponent, canActivate: [AuthGuard] },
  { path: 'players/new', component: PlayerFormComponent, canActivate: [AuthGuard] },
  { path: 'players/:id', component: PlayerDetailComponent, canActivate: [AuthGuard] },
  { path: 'players/:id/edit', component: PlayerFormComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: 'login' }
];
