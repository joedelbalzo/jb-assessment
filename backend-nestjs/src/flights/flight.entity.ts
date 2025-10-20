import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Booking } from 'src/bookings/booking.entity';

@Entity({ name: 'flights' })

export class Flight {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 10, nullable: false })
  flight_number: string;

  @Column({ type: 'varchar', length: 10, nullable: false })
  origin: string;

  @Column({ type: 'varchar', length: 10, nullable: false })
  destination: string;

  @Column({ type: 'timestamp without time zone', nullable: false })
  departure_time: Date;

  @Column({ type: 'timestamp without time zone', nullable: false })
  arrival_time: Date;

  @Column({ type: 'integer', nullable: false })
  capacity: number;

  @Column({ type: 'varchar', length: 20, nullable: false })
  status: string;

  @OneToMany(() => Booking, (booking) => booking.flight, { cascade: ['remove'] })
  bookings: Booking[]

}