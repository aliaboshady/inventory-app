import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { Category } from './schemas/category.schema';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  async create(@Body() data: any): Promise<Category> {
    return this.categoryService.create(data);
  }

  @Get()
  async findAll(): Promise<Category[]> {
    return this.categoryService.findAll();
  }

  @Get('main')
  async findMain(): Promise<Category[]> {
    return this.categoryService.findMainCategories();
  }

  @Get('sub')
  async findSub(): Promise<Category[]> {
    return this.categoryService.findSubCategories();
  }

  @Get('sub/:id')
  async findSubByParent(@Param('id') id: string): Promise<Category[]> {
    return this.categoryService.findSubCategoriesByParentId(id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Category> {
    return this.categoryService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() data: any): Promise<Category> {
    return this.categoryService.update(id, data);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.categoryService.remove(id);
  }
}
