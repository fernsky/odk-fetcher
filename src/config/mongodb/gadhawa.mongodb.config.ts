import { env } from 'process';
import { config } from 'dotenv';

config(); // Initialize dotenv

console.log('Connecting to Gadhawa MongoDB:', env.GADHAWA_MONGO_DB_URI);

export const mongodbConfigGadhawa = {
  uri: env.GAHDAWA_MONGO_DB_URI || 'mongodb://localhost:27017/odk-fetcher',
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
};
