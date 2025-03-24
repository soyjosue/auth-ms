import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
  NATS_SERVERS: string[];
}

const envSchema = joi.object<EnvVars>({
  NATS_SERVERS: joi.array().items(joi.string()).min(1).required(),
});

function validateEnv<T>(
  schema: joi.ObjectSchema<T>,
  env: NodeJS.ProcessEnv,
): T {
  const result = schema.validate(
    {
      ...env,
      NATS_SERVERS: env.NATS_SERVERS?.split(','),
    },
    {
      allowUnknown: true,
      convert: true,
    },
  );

  if (result.error)
    throw new Error(`Config validation error: ${result.error.message}`);

  return result.value;
}

const validatedEnv = validateEnv(envSchema, process.env);

export const envs = {
  nats: {
    servers: validatedEnv.NATS_SERVERS,
  },
};
