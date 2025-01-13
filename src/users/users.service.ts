import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import mongoose, { Model } from 'mongoose';
import { Users } from './schema/users.schema';
import { InjectModel } from '@nestjs/mongoose';
import { LoginUserDto } from './dto/login-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(@InjectModel(Users.name) private usersModel: Model<Users>) {}

  async signUp(createUserDto: CreateUserDto) {

    const userEmail = await this.usersModel.findOne({
      email: createUserDto.email,
    });

    if (userEmail) {
      throw new BadRequestException('Email already exist');
    }

    const { password, ...userDto } = createUserDto;

    const hashedPassword = await bcrypt.hash(password, 10);

    const userData = await this.usersModel.create({
      ...userDto,
      password: hashedPassword,
    });

    return userData;
  }

  async login(loginUserDto: LoginUserDto) {
    const user = await this.usersModel.findOne({
      email: loginUserDto.email,
    });

    if (!user) {
      throw new UnauthorizedException('wrong credentials');
    }

    const matchedPassword = await bcrypt.compare(
      loginUserDto.password,
      user.password,
    );

    if (!matchedPassword) {
      throw new UnauthorizedException('wrong credentials');
    }

    return user;
  }

  

  


  async findOne(id: string) {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      throw new UnauthorizedException('Invalid or missing user ID!');
    }
  
    const user = await this.usersModel.findById(new mongoose.Types.ObjectId(id));
  
    if (!user) {
      throw new UnauthorizedException('User not found!');
    }
  
    return user;
  }
}
