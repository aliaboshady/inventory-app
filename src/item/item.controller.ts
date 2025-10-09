import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { ItemService } from './item.service';
import { Item } from './schemas/item.schema';

@Controller('items')
export class ItemController {
  constructor(private readonly itemService: ItemService) {}

  @Post()
  create(@Body() data: any): Promise<Item> {
    return this.itemService.create(data);
  }

  @Get()
  findAll(@Query() query: Record<string, string>): Promise<Item[]> {
    return this.itemService.findWithFilters(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Item> {
    return this.itemService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: any): Promise<Item> {
    return this.itemService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.itemService.remove(id);
  }
}
