import {IsEmail, IsString, IsStrongPassword} from "class-validator";

export class LoginUserDto {
    @IsEmail()
    @IsString()
    email: string;

    @IsString()
    password: string;
}