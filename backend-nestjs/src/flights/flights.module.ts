import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Flight } from "./flight.entity";
import { FlightsService } from "./flights.service";
import { FlightsController } from "./flights.controller";

@Module({
  imports: [TypeOrmModule.forFeature([Flight])],
  controllers: [FlightsController],
  providers: [FlightsService],
  exports: [FlightsService]
})

export class FlightsModule { }