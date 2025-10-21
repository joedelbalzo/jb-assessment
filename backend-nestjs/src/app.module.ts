import * as dotenv from 'dotenv';
import { join } from 'path';
dotenv.config({ path: join(process.cwd(), '.env') });

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FlightsModule } from './flights/flights.module'
import { BookingsModule } from './bookings/bookings.module';
// import { DatabaseModule } from './database/database.module'
// import { CommonModule } from './common/common.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        url: process.env.DATABASE_URL,
        autoLoadEntities: true,
        synchronize: process.env.NODE_ENV !== 'production', //this is just my lightweight fail-safe.
      }),
    }),
    FlightsModule,
    BookingsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})

export class AppModule { }
