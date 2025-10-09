import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Attribute, AttributeSchema } from './schemas/attribute.schema';
import { Category, CategorySchema } from '../category/schemas/category.schema';
import { AttributeService } from './attribute.service';
import { AttributeController } from './attribute.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Attribute.name, schema: AttributeSchema },
      { name: Category.name, schema: CategorySchema },
    ]),
  ],
  providers: [AttributeService],
  controllers: [AttributeController],
  exports: [MongooseModule],
})
export class AttributeModule {}
