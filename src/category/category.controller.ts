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
import { CategoryService } from './category.service';
import { Category } from './schemas/category.schema';
import { IPaginated } from 'src/types/shared.model';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  async create(@Body() data: any): Promise<Category> {
    return this.categoryService.create(data);
  }

  // 📋 Unified GET for all categories
  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('itemsPerPage') itemsPerPage?: string,
    @Query('name') name?: string,
  ): Promise<IPaginated> {
    return this.categoryService.findCategories({page, itemsPerPage, name});
  }

  // 🔍 Get one
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Category> {
    return this.categoryService.findOne(id);
  }

  // ✏️ Update
  @Patch(':id')
  async update(@Param('id') id: string, @Body() data: any): Promise<Category> {
    return this.categoryService.update(id, data);
  }

  // 🗑️ Delete
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.categoryService.remove(id);
  }
}
