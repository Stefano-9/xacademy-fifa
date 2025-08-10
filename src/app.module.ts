import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AuthModule } from './auth/auth.module';
import { PlayersModule } from './players/players.module';


import { Player } from './entities/player.entity';
import { Skill } from './entities/skill.entity';
import { PlayerSkill } from './entities/player-skill.entity';
import { PlayerVersion } from './entities/player-version.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.MYSQL_HOST || 'localhost',
      port: Number(process.env.MYSQL_PORT || 3306),
      username: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || 'secret',
      database: process.env.MYSQL_DB || 'fifa',
      entities: [Player, Skill, PlayerSkill, PlayerVersion],
      synchronize: true, 
      autoLoadEntities: false,
    }),
    AuthModule,
    PlayersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
