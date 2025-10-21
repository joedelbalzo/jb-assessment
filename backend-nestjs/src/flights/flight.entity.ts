import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Booking } from '../bookings/booking.entity';

@Entity({ name: 'flights' })

export class Flight {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'flight_number', type: 'varchar', length: 10, nullable: false })
  flightNumber: string;

  @Column({ type: 'varchar', length: 10, nullable: false })
  origin: string;

  @Column({ type: 'varchar', length: 10, nullable: false })
  destination: string;

  @Column({ name: 'departure_time', type: 'timestamp without time zone', nullable: false })
  departureTime: Date;

  @Column({ name: 'arrival_time', type: 'timestamp without time zone', nullable: false })
  arrivalTime: Date;

  @Column({ type: 'integer', nullable: false })
  capacity: number;

  @Column({ type: 'varchar', length: 20, nullable: false })
  status: string;

  @OneToMany(() => Booking, (booking) => booking.flight, { cascade: ['remove'] })
  bookings: Booking[]

}