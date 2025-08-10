import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-player-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './player-detail.component.html'
})
export class PlayerDetailComponent implements OnInit {
  loading = false;
  error = '';
  id!: number;

  player: any = null;
  
  skillsList: Array<{ code: string; name: string }> = [
    { code: 'PAC', name: 'Pace' },
    { code: 'SHO', name: 'Shooting' },
    { code: 'PAS', name: 'Passing' },
    { code: 'DRI', name: 'Dribbling' },
    { code: 'DEF', name: 'Defense' },
    { code: 'PHY', name: 'Physical' },
  ];

  selectedSkill = 'PAC';

  constructor(private route: ActivatedRoute, private api: ApiService) {}

  ngOnInit() {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.load();
  }

  private load() {
    this.loading = true;
    this.error = '';
    this.api.player(this.id).subscribe({
      next: (p: any) => {
        this.player = p;
      
        if (p?.skillsLatest?.length) {
          this.selectedSkill = p.skillsLatest[0].code;
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = JSON.stringify(err.error || err);
        this.loading = false;
      }
    });
  }

 
  versionsYears(): string {
    if (!this.player?.versions?.length) return '';
    return this.player.versions.map((v: any) => v.year).join(', ');
  }

  onSkillChange(value: string) {
    this.selectedSkill = value;
  }

 
  latestSkillValue(code: string): number | undefined {
    const found = (this.player?.skillsLatest || []).find((s: any) => s.code === code);
    return found?.value;
  }

  timelineForSelected(): Array<{ year: number; value: number }> {
    const skill = (this.player?.skillsTimeline || []).find((x: any) => x.code === this.selectedSkill);
    return skill?.points || [];
  }
}
