export default () => ({
  database: process.env.DATABASE_CONNECTION_STRING,
  telegramBotKey: process.env.TELEGRAM_BOT_KEY,
});
