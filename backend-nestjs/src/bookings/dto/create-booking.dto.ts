import { IsString, Length, Matches } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateBookingDTO {
  @ApiProperty({
    example: 'John Doe',
    description: 'Full name of the passenger'
  })
  @IsString()
  @Length(1, 100)
  @Matches(/^[A-Za-z ,.'-]+$/, { message: 'passenger_name must be alphabetic' })
  passenger_name: string;

  @ApiProperty({
    example: 'Economy',
    description: 'Seat Class of the booking (Economy, Business, or First Class)'
  })
  @IsString()
  @Matches(/^(Economy|Business|First Class)$/i, {
    message: 'Seat Class must be Economy, Business, or First Class'
  })
  seat_class: string

}