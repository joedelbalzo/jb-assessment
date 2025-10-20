import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Flight } from "./flight.entity";
import { FlightsService } from "./flights.service";
import { FlightsController } from "./flights.controller";
import { BookingsModule } from "src/bookings/bookings.module";

@Module({
  imports: [TypeOrmModule.forFeature([Flight]), BookingsModule],
  controllers: [FlightsController],
  providers: [FlightsService]
})

export class FlightsModule { }