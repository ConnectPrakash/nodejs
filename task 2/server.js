const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

// Middleware to parse 
app.use(express.json());


const rooms = [];
const bookings = [];

// Function to get room by ID
function getRoomById(roomId) {
    return rooms.find(room => room.roomId === roomId);
}

// Function to get booking by ID
function getBookingById(bookingId) {
    return bookings.find(booking => booking.bookingId === bookingId);
}

// Endpoint to create a new room
app.post('/createRoom', (req, res) => {
    // Extract data from the request body
    const { roomName, seatsAvailable, amenities, pricePerHour } = req.body;

    // Validate if required data is provided
    if (!roomName || !seatsAvailable || isNaN(seatsAvailable) || !amenities || !pricePerHour || isNaN(pricePerHour)) {
        return res.status(400).json({ error: 'Invalid input. Please provide roomName, seatsAvailable, amenities, and pricePerHour.' });
    }

    // Create a new room
    const newRoom = {
        roomId: rooms.length + 1,
        roomName,
        seatsAvailable: parseInt(seatsAvailable),
        amenities,
        pricePerHour: parseFloat(pricePerHour),
    };

    // Add the room to the data store
    rooms.push(newRoom);

    res.json({ message: 'Room created successfully', room: newRoom });
});

// Endpoint to get all rooms
app.get('/getRooms', (req, res) => {
    res.json({ rooms });
});

// Endpoint to book a room
app.post('/bookRoom', (req, res) => {
    // Extract data from the request body
    const { customerName, date, startTime, endTime, roomId } = req.body;

    // Validate if required data is provided
    if (!customerName || !date || !startTime || !endTime || !roomId) {
        return res.status(400).json({ error: 'Invalid input. Please provide customerName, date, startTime, endTime, and roomId.' });
    }

    // Check if the room exists
    const room = getRoomById(roomId);
    if (!room) {
        return res.status(404).json({ error: 'Room not found. Please provide a valid roomId.' });
    }
    const isRoomAvailable = bookings.every(booking => {
        return (
            booking.roomId !== roomId ||
            new Date(date + ' ' + startTime) >= new Date(booking.date + ' ' + booking.endTime) ||
            new Date(date + ' ' + endTime) <= new Date(booking.date + ' ' + booking.startTime)
        );
    });

    if (!isRoomAvailable) {
        return res.status(409).json({ error: 'Room is already booked for the specified time slot.' });
    }

    // Create a new booking
    const newBooking = {
        bookingId: bookings.length + 1,
        customerName,
        date,
        startTime,
        endTime,
        roomId,
    };

    // Add the booking to the data store
    bookings.push(newBooking);

    res.json({ message: 'Room booked successfully', booking: newBooking });
});

// Endpoint to list all rooms with booked data
app.get('/listRoomsBookings', (req, res) => {
    const roomsWithBookings = rooms.map(room => {
        const roomBookings = bookings.filter(booking => booking.roomId === room.roomId);
        return {
            roomName: room.roomName,
            bookedStatus: roomBookings.length > 0,
            bookings: roomBookings,
        };
    });

    res.json({ roomsWithBookings });
});

// Endpoint to list all customers with booked data
app.get('/listCustomersBookings', (req, res) => {
    const customersWithBookings = bookings.map(booking => {
        const room = getRoomById(booking.roomId);
        return {
            customerName: booking.customerName,
            roomName: room ? room.roomName : 'Room not found',
            date: booking.date,
            startTime: booking.startTime,
            endTime: booking.endTime,
        };
    });

    res.json({ customersWithBookings });
});

// Endpoint to list booking history for a customer
app.get('/customerBookingHistory/:customerName', (req, res) => {
    const customerName = req.params.customerName;
    const customerBookings = bookings.filter(booking => booking.customerName === customerName);

    const bookingHistory = customerBookings.map(booking => {
        const room = getRoomById(booking.roomId);
        return {
            customerName: booking.customerName,
            roomName: room ? room.roomName : 'Room not found',
            date: booking.date,
            startTime: booking.startTime,
            endTime: booking.endTime,
            bookingId: booking.bookingId,
            bookingDate: booking.bookingDate,
            bookingStatus: booking.bookingStatus,
        };
    });

    res.json({ bookingHistory });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});