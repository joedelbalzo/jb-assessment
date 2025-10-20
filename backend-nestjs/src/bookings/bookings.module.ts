import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Booking } from "./booking.entity";
import { Flight } from "src/flights/flight.entity";
import { BookingsService } from "./bookings.service";
// import { BookingsController } from "./bookings.controller";


@Module({
  imports: [TypeOrmModule.forFeature([Booking, Flight])],
  // -- uncomment if you want /api/bookings, which per spec doesn't seem necessary.
  // controllers: [BookingsController],
  providers: [BookingsService],
  exports: [BookingsService]
})

export class BookingsModule { }