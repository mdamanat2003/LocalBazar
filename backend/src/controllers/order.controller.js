// Create the order
    const order = await Order.create({
      customerId,
      shopId,
      items: orderItems,
      totalAmount,
      deliveryAddress
    });

    // ==========================================
    // 🔔 REAL-TIME NOTIFICATION VIA SOCKET.IO
    // ==========================================
    const io = req.app.get('io'); // Get the Socket instance from Express
    
    // Emit to the specific shop's room
    io.to(`shop_${shopId}`).emit('new_order_received', {
      success: true,
      message: '🚨 New Order Received!',
      orderData: {
        orderId: order._id,
        totalAmount: order.totalAmount,
        itemsCount: order.items.length
      }
    });
    // ==========================================

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: order
    });