import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Item, ItemSchema } from './schemas/item.schema';
import { Category, CategorySchema } from 'src/category/schemas/category.schema';
import { ItemService } from './item.service';
import { ItemController } from './item.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Item.name, schema: ItemSchema },
      { name: Category.name, schema: CategorySchema },
    ]),
  ],
  providers: [ItemService],
  controllers: [ItemController],
  exports: [MongooseModule],
})
export class ItemModule {}
