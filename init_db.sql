-- Create Flights Table
CREATE TABLE IF NOT EXISTS flights (
    id SERIAL PRIMARY KEY,
    flight_number VARCHAR(10) NOT NULL UNIQUE,
    origin VARCHAR(10) NOT NULL,
    destination VARCHAR(10) NOT NULL,
    departure_time TIMESTAMP NOT NULL,
    arrival_time TIMESTAMP NOT NULL,
    capacity INT NOT NULL,
    status VARCHAR(20) DEFAULT 'Scheduled'
);

-- Create Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    flight_id INT NOT NULL,
    passenger_name VARCHAR(100) NOT NULL,
    seat_class VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'Confirmed',
    FOREIGN KEY (flight_id) REFERENCES flights(id) ON DELETE CASCADE
);

-- Insert 50 Sample Flights for Pagination Testing
INSERT INTO flights (flight_number, origin, destination, departure_time, arrival_time, capacity, status) VALUES
('AI-202', 'JFK', 'LAX', '2025-03-15 10:00:00', '2025-03-15 14:00:00', 180, 'Scheduled'),
('BA-305', 'LHR', 'JFK', '2025-03-16 12:00:00', '2025-03-16 16:30:00', 220, 'Scheduled'),
('LH-789', 'FRA', 'SFO', '2025-03-17 08:00:00', '2025-03-17 14:00:00', 200, 'Scheduled'),
('EK-501', 'DXB', 'ORD', '2025-03-18 15:00:00', '2025-03-18 21:00:00', 250, 'Scheduled'),
('SQ-22', 'SIN', 'LAX', '2025-03-19 18:00:00', '2025-03-19 10:00:00', 280, 'Scheduled'),
('AF-128', 'CDG', 'JFK', '2025-03-20 09:00:00', '2025-03-20 12:00:00', 200, 'Scheduled'),
('QR-777', 'DOH', 'LHR', '2025-03-21 05:00:00', '2025-03-21 11:00:00', 300, 'Scheduled'),
('DL-450', 'ATL', 'SEA', '2025-03-22 14:00:00', '2025-03-22 17:30:00', 180, 'Scheduled');

-- Generate Additional 42 Random Flights
DO $$ 
DECLARE i INT;
BEGIN
    FOR i IN 1..42 LOOP
        INSERT INTO flights (flight_number, origin, destination, departure_time, arrival_time, capacity, status)
        VALUES (
            'FL-' || (200 + i), 
            CASE WHEN i % 3 = 0 THEN 'JFK' WHEN i % 3 = 1 THEN 'ORD' ELSE 'LAX' END, 
            CASE WHEN i % 3 = 0 THEN 'LAX' WHEN i % 3 = 1 THEN 'DFW' ELSE 'ATL' END,
            NOW() + (i * INTERVAL '2 hours'),
            NOW() + (i * INTERVAL '5 hours'),
            150 + (i % 3) * 50,
            'Scheduled'
        );
    END LOOP;
END $$;

-- Insert 100 Sample Bookings for Pagination Testing
DO $$ 
DECLARE i INT;
BEGIN
    FOR i IN 1..100 LOOP
        INSERT INTO bookings (flight_id, passenger_name, seat_class, status)
        VALUES (
            (i % 50) + 1,
            'Passenger ' || i,
            CASE WHEN i % 3 = 0 THEN 'Economy' WHEN i % 3 = 1 THEN 'Business' ELSE 'First Class' END,
            'Confirmed'
        );
    END LOOP;
END $$;
