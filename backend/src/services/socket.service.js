const Delivery = require('../models/Delivery');

const initializeSocket = (io) => {

    io.on('connection', (socket) => {
    console.log(`🟢 New client connected: ${socket.id}`);

    // When a user, shop, or delivery partner opens the app, they send a 'join' event
    socket.on('join', ({ id, role }) => {
      if (!id || !role) return;
      
      const roomName = `${role}_${id}`; // Example: "shop_65f1a2b3c4d5e6f7"
      socket.join(roomName);
      console.log(`🏠 Socket ${socket.id} joined room: ${roomName}`);
    });

    // Handle disconnection
    socket.on('join_tracking', ({ orderId }) => {
      if (!orderId) return;
      const trackingRoom = `tracking_${orderId}`;
      socket.join(trackingRoom);
      console.log(`🗺️ Client tracking order: ${trackingRoom}`);
    });

    // 3. Receive Live Location from Delivery Boy
    socket.on('update_location', async (data) => {
      // data expected: { deliveryId, orderId, lat, lng }
      const { deliveryId, orderId, lat, lng } = data;

      if (!deliveryId || !lat || !lng) return;

      // Broadcast the exact coordinates instantly to the customer's map
      if (orderId) {
        io.to(`tracking_${orderId}`).emit('location_updated', {
          lat,
          lng,
          timestamp: Date.now()
        });
    }// Save the latest location to MongoDB (runs in the background)
      // This is helpful for Admin tracking and if the user app disconnects
      try {
        await Delivery.findByIdAndUpdate(deliveryId, {
          currentLocation: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)] // MongoDB needs [longitude, latitude]
          }
        });
      } catch (error) {
        console.error("Failed to update delivery location in DB:", error);
      }
    });

    socket.on('disconnect', () => {
      console.log(`🔴 Client disconnected: ${socket.id}`);
    });
  });
};
module.exports = initializeSocket;