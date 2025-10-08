import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Attribute } from './schemas/attribute.schema';

@Injectable()
export class AttributeService {
  constructor(
    @InjectModel(Attribute.name) private attributeModel: Model<Attribute>,
  ) {}

  async create(data: any): Promise<Attribute> {
    const created = new this.attributeModel(data);
    return created.save();
  }

  async findAll(): Promise<Attribute[]> {
    return this.attributeModel.find().exec();
  }

  async findOne(id: string): Promise<Attribute> {
    const attribute = await this.attributeModel.findById(id).exec();
    if (!attribute) throw new NotFoundException('Attribute not found');
    return attribute;
  }

  async update(id: string, data: any): Promise<Attribute> {
    const updated = await this.attributeModel.findByIdAndUpdate(id, data, {
      new: true,
    });
    if (!updated) throw new NotFoundException('Attribute not found');
    return updated;
  }

  async remove(id: string): Promise<void> {
    const result = await this.attributeModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundException('Attribute not found');
  }
}
