import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  ParseIntPipe,
  UploadedFile,
  UseInterceptors,
  Res,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { PlayersService } from './players.service';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';

@UseGuards(JwtAuthGuard)
@Controller('players')
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  @Get()
  async list(
    @Query('name') name?: string,
    @Query('club') club?: string,
    @Query('position') position?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.playersService.findAll({
      name,
      club,
      position,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
    });
  }

  
  @Get('export.csv')
  async exportCsv(
    @Res() res: Response,
    @Query('name') name?: string,
    @Query('club') club?: string,
    @Query('position') position?: string,
  ) {
    const rows = await this.playersService.findAllForExport({ name, club, position });
    const header = ['id','name','club','position','rating','nationality'];
    const csv = [header.join(',')]
      .concat(
        rows.map((r) =>
          [
            r.id,
            `"${(r.name || '').replace(/"/g, '""')}"`,
            `"${(r.club || '').replace(/"/g, '""')}"`,
            `"${(r.position || '').replace(/"/g, '""')}"`,
            r.rating ?? '',
            `"${(r.nationality || '').replace(/"/g, '""')}"`,
          ].join(','),
        ),
      )
      .join('\r\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="players.csv"');
    res.status(200).send(csv);
  }

  
  @Get(':id')
  async getOne(@Param('id', ParseIntPipe) id: number) {
    return this.playersService.findOneWithSkills(id);
  }

  
  @Post()
  async create(@Body() dto: any) {
    return this.playersService.create(dto);
  }

  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: any) {
    return this.playersService.update(id, dto);
  }

 
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.playersService.remove(id);
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  async importCsv(@UploadedFile() file?: Express.Multer.File) {
    if (!file) throw new HttpException('Archivo requerido', HttpStatus.BAD_REQUEST);
    const text = file.buffer?.toString('utf8') ?? '';
    return this.playersService.importCsv(text);
  }
}
