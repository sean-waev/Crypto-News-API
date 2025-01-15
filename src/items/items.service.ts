import { Comment } from './../comments/schemas/comment.schema';
import { Inject, Injectable } from '@nestjs/common';
import { Item } from './interfaces/item.interface';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ItemDTO } from './dto/item.dto';
import { UsersService } from 'src/Users/users.service';

@Injectable()
export class ItemsService {
  constructor(
    @InjectModel('Item') private readonly itemModel: Model<Item>,
    @InjectModel('Comment') private readonly commentModel: Model<Comment>,
    @Inject(UsersService) private usersService: UsersService,
  ) {}
  //   private readonly items: Item[] = [];

  async findAll(): Promise<Item[]> {
    const findAllI = await this.itemModel.find().exec();
    return findAllI;
  }
  async findAllPast(): Promise<Item[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const findAllI = await this.itemModel.find().exec();

    const itemsBeforeToday = findAllI.filter((item) => item.createdAt < today);
    return itemsBeforeToday;
  }
  async findAllNewest(): Promise<Item[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const findAllI = await this.itemModel.find().exec();

    const itemsNewest = findAllI.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
    return itemsNewest;
  }

  async findAllMain(): Promise<Item[]> {
    const findAllI = await this.itemModel.find().exec();

    const itemsMain = findAllI.sort(
      (a, b) =>
        b.points / (Math.log(Date.now() - b.createdAt.getTime()) * 6) -
        a.points / (Math.log(Date.now() - a.createdAt.getTime()) * 6),
      // Math.pow(item.points, Date.now() - item.createdAt.getTime()),
    );
    return itemsMain;
  }

  async findAllMainPagination(page: number): Promise<Item[]> {
    const pageSize = 30;
    const skip = page * pageSize;

    const itemsMain = await this.itemModel.aggregate([
      {
        $addFields: {
          customScore: {
            $divide: [
              { $add: ['$points', 1] },

              {
                $subtract: [new Date(), '$createdAt'],
              },
            ],
          },
        },
      },
      { $sort: { customScore: -1 } },
      { $skip: skip },
      { $limit: pageSize },
    ]);

    return itemsMain;
  }

  async findAllNewestPagination(page: number): Promise<Item[]> {
    const pageSize = 30;
    const skip = page * pageSize;

    const itemsMain = await this.itemModel
      .find()
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(pageSize)
      .exec();

    return itemsMain;
  }

  async findAllAskPagination(page: number): Promise<Item[]> {
    const pageSize = 30;
    const skip = page * pageSize;

    const itemsMain = await this.itemModel
      .find({ title: { $regex: '^AskCN', $options: 'i' } })
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(pageSize)
      .exec();

    return itemsMain;
  }

  async findAllShowPagination(page: number): Promise<Item[]> {
    const pageSize = 30;
    const skip = page * pageSize;

    const itemsMain = await this.itemModel
      .find({ title: { $regex: '^ShowCN', $options: 'i' } })
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(pageSize)
      .exec();

    return itemsMain;
  }

  async findAllShow(): Promise<Item[]> {
    const findAllI = await this.itemModel.find().exec();

    const itemsShow = findAllI.filter((item) =>
      item.title.startsWith('ShowCN:'),
    );
    return itemsShow;
  }

  async findAllAsk(): Promise<Item[]> {
    const findAllI = await this.itemModel.find().exec();

    const itemsAsk = findAllI.filter((item) => item.title.startsWith('AskCN:'));
    return itemsAsk;
  }

  async findById(id: string): Promise<Item> {
    return id.match(/^[0-9a-fA-F]{24}$/)
      ? await this.itemModel.findOne({ _id: id })
      : null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      return await this.itemModel.findOne({ _id: id });
    }
  }

  async findByNewest(id: string): Promise<Item> {
    return id.match(/^[0-9a-fA-F]{24}$/)
      ? await this.itemModel.findOne({ _id: id })
      : null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      return await this.itemModel.findOne({ _id: id });
    }
  }

  async findByPast(id: string): Promise<Item> {
    return id.match(/^[0-9a-fA-F]{24}$/)
      ? await this.itemModel.findOne({ _id: id })
      : null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      return await this.itemModel.findOne({ _id: id });
    }
  }

  async findByAlg(id: string): Promise<Item> {
    return id.match(/^[0-9a-fA-F]{24}$/)
      ? await this.itemModel.findOne({ _id: id })
      : null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      return await this.itemModel.findOne({ _id: id });
    }
  }

  async create(item: ItemDTO) {
    const newItem = await new this.itemModel(item);
    const user = await this.usersService.findByUsername(newItem.author);
    const newSubmissions = user.submissions;
    newSubmissions?.push(newItem.id);
    this.usersService.update(user.id, {
      submissions: newSubmissions || [newItem.id],
    });
    return newItem.save();
  }
  async delete(id: string): Promise<Item> {
    // Step 1: Find the item by ID to retrieve the comment IDs
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const item = await this.itemModel.findById(id);

    // Step 2: Delete all comments associated with this item
    await this.commentModel.deleteMany({ _id: { $in: item.comments } });

    // Step 3: Delete the item itself
    return this.itemModel.findByIdAndDelete(id);
  }

  async update(id: string, item: ItemDTO): Promise<Item> {
    return await this.itemModel.findByIdAndUpdate(id, item, { new: true });
  }

  async upVote(
    id: string,
    currentUser: { currentUserName: string },
  ): Promise<Item> {
    const item = await this.findById(id);
    const user = await this.usersService.findByUsername(
      currentUser.currentUserName,
    );
    const newUpvotes = user?.upvotedSubmissions;
    newUpvotes?.push(id);
    this.usersService.update(user.id, {
      upvotedSubmissions: newUpvotes || [id],
    });

    return await this.itemModel.findByIdAndUpdate(
      id,
      { points: item.points + 1 },
      { new: true },
    );
  }
  async downVote(
    id: string,
    currentUser: { currentUserName: string },
  ): Promise<Item> {
    const item = await this.findById(id);

    const user = await this.usersService.findByUsername(
      currentUser.currentUserName,
    );
    const newUpVotedSubmissions = user.upvotedSubmissions.filter(
      (vote) => vote !== id,
    );
    this.usersService.update(user.id, {
      upvotedSubmissions: newUpVotedSubmissions,
    });

    return await this.itemModel.findByIdAndUpdate(
      id,
      { points: item.points - 1 },
      { new: true },
    );
  }
}
