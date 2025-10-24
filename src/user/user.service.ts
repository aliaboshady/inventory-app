import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const createdUser = new this.userModel(createUserDto);
    return createdUser.save();
  }

  async findAll(search?: string, role?: string): Promise<User[]> {
    const filters: any = {};

    // Add role filter if provided
    if (role) {
      filters.role = role;
    }

    // Add search filter if provided
    if (search) {
      const regex = new RegExp(search, 'i'); // case-insensitive
      filters.$or = [
        { firstName: regex },
        { lastName: regex },
        { email: regex },
      ];
    }

    return this.userModel.find(filters).select('-password').exec();
  }

  async findById(id: string): Promise<User> {
    const user = await this.userModel.findById(id).select('-password').exec();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    // 🚫 Prevent updating password through this endpoint
    if ('password' in data) {
      delete data.password;
    }

    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, data, { new: true })
      .select('-password')
      .exec();

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    return updatedUser;
  }

  async delete(id: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('User not found');
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async changePassword(id: string, newPassword: string): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    if (!user) throw new NotFoundException('User not found');

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    const { password, ...result } = user.toObject();
    return result as unknown as User;
  }
}
