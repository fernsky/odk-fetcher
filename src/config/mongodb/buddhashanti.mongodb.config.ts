import { env } from 'process';
import { config } from 'dotenv';

config(); // Initialize dotenv

console.log(
  'Connecting to Buddhashanti MongoDB:',
  env.BUDDHASHANTI_MONGO_DB_URI,
);

export const mongodbConfigBuddhashanti = {
  uri: env.BUDDHASHANTI_MONGO_DB_URI || 'mongodb://localhost:27017/odk-fetcher',
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
};
