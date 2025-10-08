import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { AttributeService } from './attribute.service';
import { Attribute } from './schemas/attribute.schema';

@Controller('attributes')
export class AttributeController {
  constructor(private readonly attributeService: AttributeService) {}

  @Post()
  async create(@Body() data: any): Promise<Attribute> {
    return this.attributeService.create(data);
  }

  @Get()
  async findAll(): Promise<Attribute[]> {
    return this.attributeService.findAll();
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
