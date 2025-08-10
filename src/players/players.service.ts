import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Player } from '../entities/player.entity';
import { Skill } from '../entities/skill.entity';
import { PlayerSkill } from '../entities/player-skill.entity';
import { PlayerVersion } from '../entities/player-version.entity';

type ListQuery = {
  name?: string;
  club?: string;
  position?: string;
  page?: number;
  limit?: number;
};

@Injectable()
export class PlayersService implements OnModuleInit {
  constructor(
    @InjectRepository(Player) private playersRepo: Repository<Player>,
    @InjectRepository(Skill) private skillsRepo: Repository<Skill>,
    @InjectRepository(PlayerSkill) private playerSkillsRepo: Repository<PlayerSkill>,
    @InjectRepository(PlayerVersion) private versionsRepo: Repository<PlayerVersion>,
  ) {}


  async onModuleInit() {
    const baseSkills = ['PAC', 'SHO', 'PAS', 'DRI', 'DEF', 'PHY'];
    for (const code of baseSkills) {
      const exists = await this.skillsRepo.findOne({ where: { code } });
      if (!exists) {
        await this.skillsRepo.save(this.skillsRepo.create({ code, name: code }));
      }
    }
  }


  async findAll(query: ListQuery) {
    const page = Math.max(1, Number(query.page || 1));
    const limit = Math.min(100, Math.max(1, Number(query.limit || 20)));
    const where: any = {};
    if (query.name) where.name = ILike(`%${query.name}%`);
    if (query.club) where.club = ILike(`%${query.club}%`);
    if (query.position) where.position = ILike(`%${query.position}%`);

    const [data, total] = await this.playersRepo.findAndCount({
      where,
      order: { name: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { page, limit, total, data };
  }


  async findAllForExport(filter: { name?: string; club?: string; position?: string }) {
    const where: any = {};
    if (filter.name) where.name = ILike(`%${filter.name}%`);
    if (filter.club) where.club = ILike(`%${filter.club}%`);
    if (filter.position) where.position = ILike(`%${filter.position}%`);
    return this.playersRepo.find({ where, order: { name: 'ASC' } });
  }


  async findOneWithSkills(id: number) {
    const player = await this.playersRepo.findOne({
      where: { id },
      relations: ['versions'],
      order: { versions: { year: 'ASC' } },
    });
    if (!player) throw new NotFoundException('Player not found');

    const skills = await this.playerSkillsRepo.find({
      where: { player: { id } },
      relations: ['skill'],
      order: { year: 'ASC' },
    });

    const allYears = Array.from(new Set(skills.map((s) => s.year))).sort((a, b) => a - b);
    const latestYear = allYears.length ? allYears[allYears.length - 1] : undefined;

    const skillsLatest = skills
      .filter((s) => s.year === latestYear)
      .map((s) => ({ code: s.skill.code, name: s.skill.name, value: s.value }));

    const bySkill = new Map<
      string,
      { code: string; name: string; points: { year: number; value: number }[] }
    >();
    for (const s of skills) {
      const k = s.skill.code;
      if (!bySkill.has(k)) bySkill.set(k, { code: k, name: s.skill.name, points: [] });
      bySkill.get(k)!.points.push({ year: s.year, value: s.value });
    }
    const skillsTimeline = Array.from(bySkill.values())
      .map((x) => ({ ...x, points: x.points.sort((a, b) => a.year - b.year) }))
      .sort((a, b) => a.code.localeCompare(b.code));

    return {
      id: player.id,
      name: player.name,
      club: player.club,
      position: player.position,
      rating: player.rating,
      nationality: player.nationality,
      versions: (player.versions || []).map((v) => ({ year: v.year, age: v.age, rating: v.rating })),
      latestYear,
      skillsLatest,
      skillsTimeline,
    };
  }


  async create(dto: any) {
    const { name, club, position, rating, nationality, year, skills } = dto;

    const player = await this.playersRepo.save(
      this.playersRepo.create({ name, club, position, rating, nationality }),
    );

    if (year) {
      await this.versionsRepo.save(
        this.versionsRepo.create({
          player,
          year: Number(year),
          rating: typeof rating === 'number' ? rating : player.rating,
        }),
      );
    }

    if (skills && typeof skills === 'object') {
      const skillRows = await this.skillsRepo.find();
      const y = Number(year) || new Date().getFullYear();
      for (const s of skillRows) {
        const v = Number((skills as Record<string, unknown>)[s.code] as number);
        if (!Number.isNaN(v)) {
          await this.playerSkillsRepo.save(
            this.playerSkillsRepo.create({ player, skill: s, year: y, value: v }),
          );
        }
      }
    }

    return player;
  }


  async update(id: number, dto: any) {
    const player = await this.playersRepo.findOne({ where: { id } });
    if (!player) throw new NotFoundException('Player not found');

    const { club, position, rating, nationality, year, skills } = dto;
    if (club !== undefined) player.club = club;
    if (position !== undefined) player.position = position;
    if (typeof rating === 'number') player.rating = rating;
    if (nationality !== undefined) player.nationality = nationality;
    await this.playersRepo.save(player);

    if (skills && typeof skills === 'object') {
      const skillRows = await this.skillsRepo.find();
      const y = Number(year) || new Date().getFullYear();
      for (const s of skillRows) {
        const v = Number((skills as Record<string, unknown>)[s.code] as number);
        if (!Number.isNaN(v)) {
          let ps = await this.playerSkillsRepo.findOne({
            where: { player: { id }, skill: { id: s.id }, year: y },
            relations: ['player', 'skill'],
          });
          if (!ps) {
            ps = this.playerSkillsRepo.create({ player, skill: s, year: y, value: v });
          } else {
            ps.value = v;
          }
          await this.playerSkillsRepo.save(ps);
        }
      }

      if (typeof rating === 'number') {
        let ver = await this.versionsRepo.findOne({
          where: { player: { id }, year: y },
          relations: ['player'],
        });
        if (!ver) {
          ver = this.versionsRepo.create({ player, year: y, rating });
        } else {
          ver.rating = rating;
        }
        await this.versionsRepo.save(ver);
      }
    }

    return player;
  }

  async remove(id: number) {
    const player = await this.playersRepo.findOne({ where: { id } });
    if (!player) throw new NotFoundException('Player not found');
    await this.playersRepo.remove(player);
    return { ok: true };
  }


  async importFromCsv(csv: string) {
    const lines = csv.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length <= 1) return { imported: 0, errors: ['CSV vacío'] };

    const header = lines[0].split(',').map((h) => h.trim());
    const req = ['name', 'club', 'position', 'rating', 'nationality', 'year', 'PAC', 'SHO', 'PAS', 'DRI', 'DEF', 'PHY'];
    for (const k of req) {
      if (!header.includes(k)) {
        return { imported: 0, errors: [`Falta columna: ${k}`] };
      }
    }

    const idx: Record<string, number> = {};
    header.forEach((h, i) => (idx[h] = i));

    const baseSkills = ['PAC', 'SHO', 'PAS', 'DRI', 'DEF', 'PHY'];
    for (const code of baseSkills) {
      const exists = await this.skillsRepo.findOne({ where: { code } });
      if (!exists) await this.skillsRepo.save(this.skillsRepo.create({ code, name: code }));
    }
    const skills = await this.skillsRepo.find();

    let imported = 0;
    const errors: string[] = [];

    for (let li = 1; li < lines.length; li++) {
      const raw = lines[li];
      if (!raw.trim()) continue;

      const cols = raw.split(',');

      try {
        const name = cols[idx['name']]?.trim();
        const club = cols[idx['club']]?.trim();
        const position = cols[idx['position']]?.trim();
        const rating = Number(cols[idx['rating']]);
        const nationality = cols[idx['nationality']]?.trim();
        const year = Number(cols[idx['year']]);

        if (!name) throw new Error('name vacío');

      
        let player = await this.playersRepo.findOne({ where: { name } });
        if (!player) {
          player = await this.playersRepo.save(
            this.playersRepo.create({
              name,
              club,
              position,
              rating: Number.isNaN(rating) ? undefined : rating,
              nationality,
            }),
          );
        } else {
          if (club) player.club = club;
          if (position) player.position = position;
          if (!Number.isNaN(rating)) player.rating = rating;
          if (nationality) player.nationality = nationality;
          await this.playersRepo.save(player);
        }

      
        if (!Number.isNaN(year)) {
          let v = await this.versionsRepo.findOne({ where: { player: { id: player.id }, year } });
          if (!v) {
            v = this.versionsRepo.create({
              player,
              year,
              rating: !Number.isNaN(rating) ? rating : player.rating,
            });
          } else {
            if (!Number.isNaN(rating)) v.rating = rating;
          }
          await this.versionsRepo.save(v);
        }

        
        for (const s of skills) {
          const valStr = cols[idx[s.code]];
          const value = Number(valStr);
          if (!Number.isNaN(value) && !Number.isNaN(year)) {
            let ps = await this.playerSkillsRepo.findOne({
              where: { player: { id: player.id }, skill: { id: s.id }, year },
              relations: ['player', 'skill'],
            });
            if (!ps) {
              ps = this.playerSkillsRepo.create({ player, skill: s, year, value });
            } else {
              ps.value = value;
            }
            await this.playerSkillsRepo.save(ps);
          }
        }

        imported++;
      } catch (e: any) {
        errors.push(`Línea ${li + 1}: ${e?.message || String(e)}`);
      }
    }

    return { imported, errors };
  }

  async importCsv(csv: string) {
    return this.importFromCsv(csv);
  }
}
