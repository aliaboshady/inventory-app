import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
} from '@nestjs/common';
import { AttributeService } from './attribute.service';
import { Attribute } from './schemas/attribute.schema';
import { IPaginated } from 'src/types/shared.model';

@Controller('attributes')
export class AttributeController {
  constructor(private readonly attributeService: AttributeService) {}

  @Post()
  async create(@Body() data: any): Promise<Attribute> {
    return this.attributeService.create(data);
  }

  // 🧩 Supports optional category filter + pagination
  @Get()
  async findAll(
    @Query('category') categoryId?: string,
    @Query('page') page?: string,
    @Query('itemsPerPage') itemsPerPage?: string,
  ): Promise<IPaginated> {
    const p = parseInt(page || '1', 10);
    const limit = parseInt(itemsPerPage || '10', 10);
    return this.attributeService.findAll(categoryId, p, limit);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Attribute> {
    return this.attributeService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() data: any): Promise<Attribute> {
    return this.attributeService.update(id, data);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.attributeService.remove(id);
  }
}
