import { env } from 'process';
import { config } from 'dotenv';

config(); // Initialize dotenv

console.log('Connecting to Lungri MongoDB:', env.LUNGRI_MONGO_DB_URI);

export const mongodbConfigLungri = {
  uri: env.LUNGRI_MONGO_DB_URI || 'mongodb://localhost:27017/odk-fetcher',
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
};
