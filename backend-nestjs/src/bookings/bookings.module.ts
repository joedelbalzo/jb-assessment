import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Booking } from "./booking.entity";
import { Flight } from "src/flights/flight.entity";
import { BookingsService } from "./bookings.service";
import { BookingsController } from "./bookings.controller";


@Module({
  imports: [TypeOrmModule.forFeature([Booking, Flight])],
  controllers: [BookingsController],
  providers: [BookingsService],
  exports: [BookingsService]
})

export class BookingsModule { }