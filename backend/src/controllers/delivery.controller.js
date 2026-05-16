const Delivery = require('../models/Delivery');
const Order = require('../models/Order');

// ==========================================
// 1. Toggle Online/Offline Status
// ==========================================
exports.toggleAvailability = async (req, res) => {
  try {
    const deliveryId = req.user.id;
    const { isAvailable } = req.body;

    if (typeof isAvailable !== 'boolean') {
      return res.status(400).json({ success: false, message: 'isAvailable must be true or false' });
    }

    const rider = await Delivery.findByIdAndUpdate(
      deliveryId,
      { isAvailable },
      { new: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: isAvailable ? 'You are now Online 🟢' : 'You are now Offline 🔴',
      data: rider
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// ==========================================
// 2. Accept an Order
// ==========================================
exports.acceptOrder = async (req, res) => {
  try {
    const deliveryId = req.user.id;
    const { orderId } = req.params;

    // 1. Check if rider is approved and online
    const rider = await Delivery.findById(deliveryId);
    if (!rider.isApproved || !rider.isAvailable) {
      return res.status(403).json({ success: false, message: 'You must be online and approved to accept orders' });
    }

    // 2. Check if rider already has an active order
    if (rider.currentOrderId) {
      return res.status(400).json({ success: false, message: 'You already have an active delivery' });
    }

    // 3. Find the order and ensure it hasn't been taken by someone else
    const order = await Order.findById(orderId);
    if (!order || order.deliveryPartnerId) {
      return res.status(400).json({ success: false, message: 'Order is no longer available' });
    }

    // 4. Assign the order to the rider
    order.deliveryPartnerId = deliveryId;
    // Assuming the shop already 'Accepted' it, the status moves to 'Assigning', and now 'PickedUp' or 'OutForDelivery' based on your exact business flow. Let's set it to 'OutForDelivery' for simplicity when a rider claims it.
    order.status = 'OutForDelivery';
    await order.save();

    // 5. Update the rider's current active order
    rider.currentOrderId = orderId;
    await rider.save();

    // TODO: Emit Socket event to Customer and Shop that rider is assigned!

    res.status(200).json({
      success: true,
      message: 'Order accepted successfully! Proceed to shop.',
      data: order
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// ==========================================
// 3. Get Rider Dashboard (Active Order & History)
// ==========================================
exports.getDashboard = async (req, res) => {
  try {
    const deliveryId = req.user.id;

    // Fetch rider details and populate the current active order
    const rider = await Delivery.findById(deliveryId)
      .select('-password')
      .populate('currentOrderId');

    // Count how many orders this rider has successfully delivered
    const totalDelivered = await Order.countDocuments({
      deliveryPartnerId: deliveryId,
      status: 'Delivered'
    });

    res.status(200).json({
      success: true,
      data: {
        profile: rider,
        activeOrder: rider.currentOrderId || null,
        totalCompletedDeliveries: totalDelivered
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};