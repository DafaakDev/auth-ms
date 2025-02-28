import 'dotenv/config';
import * as joi from 'joi';
import * as process from 'node:process';

interface EnvVars {
    PORT: number;
    NATS_SERVER: string;
    JWT_SECRET: string;
}

const envsSchema = joi
    .object({
        PORT: joi.number().required(),
        NATS_SERVER: joi.string().required(),
        JWT_SECRET: joi.string().required(),
    })
    .unknown(true);

const {error, value} = envsSchema.validate(process.env);

if (error) throw new Error(`Config validation Error: ${error.message}`);

const envVars: EnvVars = value;

export const envs = {
    port: envVars.PORT,
    natsServer: envVars.NATS_SERVER,
    jwtSecret: envVars.JWT_SECRET
};
