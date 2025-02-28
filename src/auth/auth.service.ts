import {Injectable, Logger, OnModuleInit} from '@nestjs/common';
import {PrismaClient} from "@prisma/client";
import {LoginUserDto, RegisterUserDto} from "./dto";
import {RpcException} from "@nestjs/microservices";
import * as bcrypt from 'bcrypt';
import {JwtService} from "@nestjs/jwt";
import {JwtPayload} from "./interfaces/jwt-payload.interface";
import {envs} from "../config";

@Injectable()
export class AuthService extends PrismaClient implements OnModuleInit {
    private readonly logger = new Logger('AUTH-SERVICE');

    constructor(
        private readonly jwtService: JwtService
    ) {
        super();
    }

    onModuleInit() {
        this.$connect();
        this.logger.log('MongoDB connected');
    }

    async signJWt(payload: JwtPayload) {
        return this.jwtService.sign(payload);
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
                    password: bcrypt.hashSync(password, 10),
                    name
                }
            });

            const {password: __, ...rest} = newUser;
            return {
                user: rest,
                token: await this.signJWt(rest)
            }

        } catch (e) {
            throw new RpcException({
                status: 400,
                message: e.message
            })
        }

    }

    async loginUser(loginUserDto: LoginUserDto) {

        const {email, password} = loginUserDto;
        try {
            const user = await this.user.findUnique({
                where: {email: email}
            });

            if (!user) {
                throw new RpcException({
                    status: 400,
                    message: `Invalid credentials`
                })
            }

            const isPassValid = bcrypt.compareSync(password, user.password)

            if (!isPassValid) {
                throw new RpcException({
                    status: 400,
                    message: `Invalid credentials`
                })
            }

            const {password: __, ...rest} = user;

            return {
                user: rest,
                token: await this.signJWt(rest)
            }

        } catch (e) {
            throw new RpcException({
                status: 400,
                message: e.message
            })
        }

    }

    async verifyUser(token: string) {
        try {
            const {sub, iat, exp, ...user} = this.jwtService.verify(token, {
                secret: envs.jwtSecret
            });

            return {user, token: await this.signJWt(user)}

        } catch (e) {
            throw new RpcException({
                status: 401,
                message: 'Invalid token'
            })
        }
    }

}
