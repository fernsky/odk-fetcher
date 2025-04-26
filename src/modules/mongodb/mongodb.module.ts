import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { mongodbConfigBuddhashanti } from '@app/config/mongodb/buddhashanti.mongodb.config';
import { mongodbConfigGadhawa } from '@app/config/mongodb/gadhawa.mongodb.config';
import { mongodbConfigKerabari } from '@app/config/mongodb/kerabari.mongodb.config';
import { mongodbConfigLungri } from '@app/config/mongodb/lungri.mongodb.config';

@Module({
  imports: [
    MongooseModule.forRoot(mongodbConfigBuddhashanti.uri, {
      ...mongodbConfigBuddhashanti.options,
      connectionName: 'buddhashanti',
    }),
    MongooseModule.forRoot(mongodbConfigGadhawa.uri, {
      ...mongodbConfigGadhawa.options,
      connectionName: 'gadhawa',
    }),
    MongooseModule.forRoot(mongodbConfigKerabari.uri, {
      ...mongodbConfigKerabari.options,
      connectionName: 'kerabari',
    }),
    MongooseModule.forRoot(mongodbConfigLungri.uri, {
      ...mongodbConfigLungri.options,
      connectionName: 'lungri',
    }),
  ],
})
export class MongodbModule {}
