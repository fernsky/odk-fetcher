import * as Minio from 'minio';
import { env } from 'process';
import { config } from 'dotenv';

config(); // Initialize dotenv

console.log('Connecting to Minio:', env.MINIO_ENDPOINT);
export const minio = new Minio.Client({
  endPoint: env.MINIO_ENDPOINT,
  port: parseInt(env.MINIO_PORT),
  accessKey: env.MINIO_CLIENT_ACCESS_KEY,
  secretKey: env.MINIO_CLIENT_SECRET_KEY,
  useSSL: true,
});
