import * as Joi from 'joi';
import * as dotenv from 'dotenv';
dotenv.config();

const appConfig = () => ({
  database: process.env.DATABASE_CONNECTION_STRING,
  telegramBotKey: process.env.TELEGRAM_BOT_KEY,
  frontendUrl: process.env.FRONTEND_URL,
  backendUrl: process.env.BACKEND_URL,
  pathToRestaurant: process.env.PATH_TO_RESTAURANT_PHOTOS,
  stripeKey: process.env.STRIPE_KEY,
  stripeApiVersion: process.env.STRIPE_API_VERSION,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIN: process.env.JWT_EXPIRES_IN,
});

const ConfigValidationSchema = Joi.object({
  database: Joi.string().required(),
  telegramBotKey: Joi.string().required(),
  frontendUrl: Joi.string().required(),
  backendUrl: Joi.string().required(),
  pathToRestaurant: Joi.string().required(),
  stripeKey: Joi.string().required(),
  jwtSecret: Joi.string().required(),
  jwtExpiresIN: Joi.string().required(),
  stripeApiVersion: Joi.string().required(),
});

export interface EnvironmentVariables {
  database: string;
  telegramBotKey: string;
  frontendUrl: string;
  backendUrl: string;
  pathToRestaurant: string;
  stripeKey: string;
  jwtExpiresIN: string;
  stripeApiVersion: string;
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
