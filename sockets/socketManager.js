// Import necessary modules and the Message model
const socketIO = require('socket.io');
const mongoose = require('mongoose');
const Message = require('../models/Message');
const axios = require('axios');

// Function to initialize the socket and handle socket events
function initializeSocket(server) {
    // Create a new socket.io instance with specified CORS options
    const io = socketIO(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
        },
    });

    // Event handler for a new socket connection
    io.on('connection', (socket) => {
        console.log('A user has connected');

        // Event when a user joins a room
        socket.on('joinRoom', async(room) => {
            // Join the specified room
            roomName = room.room
            socket.join(roomName);
            console.log(`User joined the room: ${roomName}`);

            // Retrieve and send historical messages for the joined room
            try {
                // Retrieve and send historical messages for the joined room
                const response = await axios.get(`${process.env.MESSAGE_ENDPOINT}${roomName}`, { params: { internalRequest: true }});
                let messages = response.data
                console.log(messages)
                socket.emit('loadMessages', messages);
            } catch (error) {
                console.error('Error retrieving historical messages:', error);
            }
        });

        // Event when a user sends a message
        socket.on('sendMessage', async (data) => {
            const { room, sender, text } = data;
            console.log(data)

            // Create a new Message model instance
            const newMessage = new Message({
                sender_user: sender,
                content: text,
                timestamp: new Date(),
                room: room,
            });

            try {
                const response = await axios.post(`${process.env.MESSAGE_ENDPOINT}`, { text, room, sender, internalRequest: true });
                console.log('Messaggio inviato con successo:', response.data);
              } catch (error) {
                console.error('Errore nell\'invio del messaggio:', error.message);
              }


            // Broadcast the new message to all users in the room
            io.to(room).emit('message', newMessage);
        });

        // Event when a user disconnects
        socket.on('disconnect', () => {
            console.log('A user has disconnected');
        });
    });

    // Return the socket.io instance for external use
    return io;
}

// Export the initializeSocket function
module.exports = initializeSocket;
