import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-player-form',
  standalone: true,
  
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './player-form.component.html'
})
export class PlayerFormComponent implements OnInit {
  form!: FormGroup;
  id?: number;
  loading = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      name: ['', [Validators.required]],
      club: ['', [Validators.required]],
      position: ['', [Validators.required]],
      rating: [80, [Validators.required, Validators.min(1), Validators.max(99)]],
      nationality: ['', [Validators.required]],
      year: [2023, [Validators.required, Validators.min(2015), Validators.max(2025)]],
      PAC: [80, [Validators.min(1), Validators.max(99)]],
      SHO: [80, [Validators.min(1), Validators.max(99)]],
      PAS: [80, [Validators.min(1), Validators.max(99)]],
      DRI: [80, [Validators.min(1), Validators.max(99)]],
      DEF: [80, [Validators.min(1), Validators.max(99)]],
      PHY: [80, [Validators.min(1), Validators.max(99)]],
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    this.id = idParam ? Number(idParam) : undefined;

    if (this.id) {
      this.loading = true;
      this.api.player(this.id).subscribe({
        next: (p: any) => {
          this.form.patchValue({
            name: p.name,
            club: p.club,
            position: p.position,
            rating: p.rating,
            nationality: p.nationality,
            year: p.latestYear ?? 2023,
            PAC: p.skillsLatest?.find((s:any)=>s.code==='PAC')?.value ?? 80,
            SHO: p.skillsLatest?.find((s:any)=>s.code==='SHO')?.value ?? 80,
            PAS: p.skillsLatest?.find((s:any)=>s.code==='PAS')?.value ?? 80,
            DRI: p.skillsLatest?.find((s:any)=>s.code==='DRI')?.value ?? 80,
            DEF: p.skillsLatest?.find((s:any)=>s.code==='DEF')?.value ?? 80,
            PHY: p.skillsLatest?.find((s:any)=>s.code==='PHY')?.value ?? 80,
          });
          this.loading = false;
        },
        error: (err) => {
          this.error = JSON.stringify(err.error || err);
          this.loading = false;
        }
      });
    }
  }

  submit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';

    const v = this.form.value as any;
    const payload = {
      name: v.name,
      club: v.club,
      position: v.position,
      rating: Number(v.rating),
      nationality: v.nationality,
      year: Number(v.year),
      skills: {
        PAC: Number(v['PAC']),
        SHO: Number(v['SHO']),
        PAS: Number(v['PAS']),
        DRI: Number(v['DRI']),
        DEF: Number(v['DEF']),
        PHY: Number(v['PHY']),
      }
    };

    const obs = this.id
      ? this.api.updatePlayer(this.id, payload)
      : this.api.createPlayer(payload);

    obs.subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/players']);
      },
      error: (err) => {
        this.error = JSON.stringify(err.error || err);
        this.loading = false;
      }
    });
  }
}
