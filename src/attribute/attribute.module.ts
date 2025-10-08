import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Attribute, AttributeSchema } from './schemas/attribute.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Attribute.name, schema: AttributeSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class AttributeModule {}
