import { Injectable } from '@nestjs/common';
import { User } from './interfaces/users.interface';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { UserDTO } from './dto/users.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel('User') private readonly userModel: Model<User>) {}
  //   private readonly users: User[] = [];

  async findAll(): Promise<User[]> {
    const findAllI = await this.userModel.find().exec();
    return findAllI;
  }

  async findAllProtected(): Promise<User[]> {
    const findAllI = await this.userModel.find({}, { password: 0 }).exec();
    return findAllI;
  }

  async findById(id: string): Promise<User> {
    return id.match(/^[0-9a-fA-F]{24}$/)
      ? await this.userModel.findOne({ _id: id })
      : null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      return await this.userModel.findOne({ _id: id });
    }
  }
  async findByUsername(Username: string): Promise<User> {
    const findUser = await this.userModel.findOne({ username: Username });
    return findUser;

    if (Username.match(Username)) {
      return await this.userModel.findOne({ username: Username });
    }
  }

  async findByPrivy(PrivyId: string): Promise<User> {
    const findUser = await this.userModel.findOne({ privyId: PrivyId });
    // If no user is found, throw an error
    if (!findUser) {
      throw new Error(`User with PrivyId ${PrivyId} not found.`);
    }

    return findUser;

    // if (PrivyId.match(PrivyId)) {
    //   return await this.userModel.findOne({ privyId: PrivyId });
    // }
  }

  async findByUsernameProtected(Username: string): Promise<User> {
    const findUser = await this.userModel.findOne({ username: Username });
    const returnUser = findUser.toJSON();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...rest } = returnUser;
    return rest;

    if (Username.match(Username)) {
      return await this.userModel.findOne({ username: Username });
    }
  }

  async create(user: UserDTO) {
    const newUser = await new this.userModel(user);
    return newUser.save();
  }
  async delete(id: string): Promise<User> {
    return this.userModel.findByIdAndDelete(id);
  }

  async update(id: string, user: UserDTO): Promise<User> {
    return await this.userModel.findByIdAndUpdate(id, user, { new: true });
  }
}
