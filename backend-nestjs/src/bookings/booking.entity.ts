import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Flight } from '../flights/flight.entity';

@Entity({ name: 'bookings' })
export class Booking {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'flight_id', type: 'integer', nullable: false })
  flightId: number;

  @Column({ name: 'passenger_name', type: 'varchar', length: 100, nullable: false })
  passengerName: string;

  @Column({ name: 'seat_class', type: 'varchar', length: 20, nullable: false })
  seatClass: string;

  @Column({ type: 'varchar', length: 20, default: 'Confirmed' })
  status: string;

  @ManyToOne(() => Flight, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'flight_id' })
  flight: Flight;
}