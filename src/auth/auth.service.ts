import {Injectable, Logger, OnModuleInit} from '@nestjs/common';
import {PrismaClient} from "@prisma/client";
import {RegisterUserDto} from "./dto";
import {RpcException} from "@nestjs/microservices";
import * as brcrypt from 'bcrypt';

@Injectable()
export class AuthService extends PrismaClient implements OnModuleInit {
    private readonly logger = new Logger('AUTH-SERVICE');

    onModuleInit() {
        this.$connect();
        this.logger.log('MongoDB connected');
    }

    async registerUser(registerUserDto: RegisterUserDto) {
        const {email, name, password} = registerUserDto;
        try {
            const user = await this.user.findUnique({
                where: {email: email}
            });

            if (user) {
                throw new RpcException({
                    status: 400,
                    message: `User already registered`
                })
            }

            const newUser = await this.user.create({
                data: {
                    email,
                    password: brcrypt.hashSync(password, 10),
                    name
                }
            });

            const {password: __, ...rest} = newUser;
            return {
                user: rest,
                token: 'TOKEN'
            }

        } catch (e) {
            throw new RpcException({
                status: 400,
                message: e.message
            })
        }

    }

}
