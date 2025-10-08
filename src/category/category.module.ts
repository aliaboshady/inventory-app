import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Category, CategorySchema } from './schemas/category.schema';
import { Attribute, AttributeSchema } from '../attribute/schemas/attribute.schema';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Category.name, schema: CategorySchema },
      { name: Attribute.name, schema: AttributeSchema },
    ]),
  ],
  exports: [MongooseModule],
  providers: [CategoryService],
  controllers: [CategoryController],
})
export class CategoryModule {}
