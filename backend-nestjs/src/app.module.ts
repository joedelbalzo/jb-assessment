import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';



import { FlightsModule } from './flights/flights.module'
import { BookingsModule } from './bookings/bookings.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 15,
    }]),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        url: process.env.DATABASE_URL,
        autoLoadEntities: true,
        synchronize: process.env.NODE_ENV !== 'production', // Lightweight disable schema auto-sync in production
      }),
    }),
    FlightsModule,
    BookingsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})

export class AppModule { }
