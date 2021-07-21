import * as Joi from 'joi';
import * as dotenv from 'dotenv';
dotenv.config();

const appConfig = () => ({
  database: process.env.DATABASE_CONNECTION_STRING,
  telegramBotKey: process.env.TELEGRAM_BOT_KEY,
  frontendUrl: process.env.FRONTEND_URL,
  pathToRestaurant: process.env.PATH_TO_RESTAURANT_PHOTOS,
});

const ConfigValidationSchema = Joi.object({
  database: Joi.string().required(),
  telegramBotKey: Joi.string().required(),
  frontendUrl: Joi.string().required(),
  pathToRestaurant: Joi.string().required(),
});

export interface EnvironmentVariables {
  database: string;
  telegramBotKey: string;
  frontendUrl: string;
  pathToRestaurant: string;
}

export const validateConfig = (): EnvironmentVariables => {
  const { value, error } = ConfigValidationSchema.validate(appConfig(), {
    abortEarly: true,
    allowUnknown: false,
  });

  if (error) {
    throw new Error(error.message);
  }

  return value;
};
