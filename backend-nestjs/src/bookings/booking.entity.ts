import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Flight } from '../flights/flight.entity';

@Entity({ name: 'bookings' })
export class Booking {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer', nullable: false })
  flight_id: number;

  @Column({ type: 'varchar', length: 100, nullable: false })
  passenger_name: string;

  @Column({ type: 'varchar', length: 20, nullable: false })
  seat_class: string;

  @Column({ type: 'varchar', length: 20, default: 'Confirmed' })
  status: string;

  @ManyToOne(() => Flight, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'flight_id' })
  flight: Flight;
}