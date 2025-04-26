import { env } from 'process';
import { config } from 'dotenv';

config(); // Initialize dotenv

console.log('Connecting to Kerabari MongoDB:', env.KERABARI_MONGO_DB_URI);

export const mongodbConfigKerabari = {
  uri: env.KERABARI_MONGO_DB_URI || 'mongodb://localhost:27017/odk-fetcher',
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
};
