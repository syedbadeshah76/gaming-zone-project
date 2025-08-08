require('dotenv').config(); // Load environment variables
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('./models/User'); // Import User model
const Order = require('./models/Order'); // Import Order model

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Allow cross-origin requests from your frontend
app.use(express.json()); // To parse JSON request bodies

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully!'))
.catch(err => console.error('MongoDB connection error:', err));

// --- API Endpoints ---

// 1. User Login/Register
// Frontend se jab user login karega, yahan pe data check/store hoga.
// Agar user naya hai toh register hoga, warna login.
app.post('/api/login', async (req, res) => {
    const { name, mobile, deskNumber } = req.body; // deskNumber bhi chahiye frontend se

    if (!name || !mobile || !deskNumber) {
        return res.status(400).json({ message: 'Name, mobile, and desk number are required.' });
    }

    try {
        let user = await User.findOne({ mobile });

        if (user) {
            // User exists, just log them in (could add password check for stronger auth)
            console.log(`User ${user.name} (${user.mobile}) logged into Desk ${deskNumber}`);
            // Check if there's an active order for this user/desk
            let activeOrder = await Order.findOne({ customerMobile: mobile, status: 'active' });
            if (activeOrder) {
                return res.status(200).json({ message: 'User logged in successfully!', user, activeOrder });
            } else {
                // If no active order, create a new one (or assume it starts when they add items)
                // For now, we'll let the frontend manage initial cart, and placeOrder will save it.
                 return res.status(200).json({ message: 'User logged in successfully!', user });
            }

        } else {
            // New user, create one. Default role is 'user'.
            user = new User({ name, mobile });
            await user.save();
            console.log(`New user ${user.name} (${user.mobile}) registered and logged into Desk ${deskNumber}`);
            res.status(201).json({ message: 'User registered and logged in successfully!', user });
        }
    } catch (error) {
        console.error('Login/Registration error:', error);
        res.status(500).json({ message: 'Server error during login/registration.' });
    }
});

// 2. Place Order (Frontend se jab cart place hoga)
app.post('/api/orders', async (req, res) => {
    const { deskNumber, customerName, customerMobile, items, totalAmount } = req.body;

    if (!deskNumber || !customerName || !customerMobile || !items || items.length === 0 || totalAmount === undefined) {
        return res.status(400).json({ message: 'Missing order details.' });
    }

    try {
        // Find if there's an existing active order for this desk/user
        let order = await Order.findOne({ deskNumber, customerMobile, status: 'active' });

        if (order) {
            // If active order exists, update it (e.g., add new items to it)
            // For simplicity, we'll replace items. In a real app, you'd merge or manage item quantities.
            order.items = items;
            order.totalAmount = totalAmount;
            order.orderTime = Date.now(); // Update time of last order
            await order.save();
            return res.status(200).json({ message: 'Order updated successfully!', order });
        } else {
            // Create a new order if none active
            const newOrder = new Order({
                deskNumber,
                customerName,
                customerMobile,
                items,
                totalAmount,
                status: 'active'
            });
            await newOrder.save();
            res.status(201).json({ message: 'Order placed successfully!', order: newOrder });
        }
    } catch (error) {
        console.error('Error placing/updating order:', error);
        res.status(500).json({ message: 'Server error while placing order.' });
    }
});

// 3. Checkout (Frontend se jab user checkout karega)
app.post('/api/checkout', async (req, res) => {
    const { deskNumber, customerMobile } = req.body;

    if (!deskNumber || !customerMobile) {
        return res.status(400).json({ message: 'Desk number and customer mobile are required for checkout.' });
    }

    try {
        const order = await Order.findOneAndUpdate(
            { deskNumber, customerMobile, status: 'active' },
            { $set: { status: 'checked_out', checkoutTime: Date.now() } },
            { new: true } // Return the updated document
        );

        if (!order) {
            return res.status(404).json({ message: 'No active order found for this desk/customer.' });
        }

        res.status(200).json({ message: 'Checkout successful!', order });
    } catch (error) {
        console.error('Error during checkout:', error);
        res.status(500).json({ message: 'Server error during checkout.' });
    }
});

// 4. Get Current User's Active Order (for dashboard to load existing order)
app.get('/api/user-active-order/:mobile', async (req, res) => {
    try {
        const mobile = req.params.mobile;
        const activeOrder = await Order.findOne({ customerMobile: mobile, status: 'active' });
        res.status(200).json({ order: activeOrder });
    } catch (error) {
        console.error('Error fetching user active order:', error);
        res.status(500).json({ message: 'Server error fetching active order.' });
    }
});


// --- ADMIN-SPECIFIC ENDPOINTS (Middleware for authorization needed for production) ---

// A simple authorization check (for demonstration, a real app needs JWT/session auth)
const isAdmin = async (req, res, next) => {
    // In a real application, you'd verify a token and check user role from it.
    // For this example, we'll assume a hardcoded admin mobile for demonstration
    // NOT FOR PRODUCTION USE
    const adminMobile = '9876543210'; // Replace with a real admin mobile or a proper auth mechanism

    // For simplicity, let's assume we pass mobile in headers for admin
    // In a real app, admin would login and get a token.
    const requestedMobile = req.headers['x-admin-mobile'];

    try {
        const adminUser = await User.findOne({ mobile: requestedMobile, role: 'admin' });
        if (adminUser) {
            next(); // User is admin, proceed
        } else {
            res.status(403).json({ message: 'Access Denied: Admin privileges required.' });
        }
    } catch (error) {
        console.error('Admin check error:', error);
        res.status(500).json({ message: 'Authentication error.' });
    }
};

// 5. Get All Orders (Admin only)
app.get('/api/admin/orders', isAdmin, async (req, res) => {
    try {
        const orders = await Order.find().sort({ orderTime: -1 }); // Latest orders first
        res.status(200).json(orders);
    } catch (error) {
        console.error('Error fetching all orders for admin:', error);
        res.status(500).json({ message: 'Server error fetching orders.' });
    }
});

// 6. Get All Users (Admin only)
app.get('/api/admin/users', isAdmin, async (req, res) => {
    try {
        const users = await User.find({});
        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching all users for admin:', error);
        res.status(500).json({ message: 'Server error fetching users.' });
    }
});

// 7. Mark a Desk as Free (Admin only - if a session ends abruptly or needs manual reset)
app.post('/api/admin/free-desk', isAdmin, async (req, res) => {
    const { deskNumber } = req.body;
    if (!deskNumber) {
        return res.status(400).json({ message: 'Desk number is required.' });
    }
    try {
        // Find and mark any active order for this desk as checked out
        const result = await Order.findOneAndUpdate(
            { deskNumber, status: 'active' },
            { $set: { status: 'checked_out', checkoutTime: Date.now() } },
            { new: true }
        );

        if (result) {
            res.status(200).json({ message: `Desk ${deskNumber} marked as free and associated order checked out.`, order: result });
        } else {
            res.status(200).json({ message: `Desk ${deskNumber} was already free or no active order found.` });
        }
    } catch (error) {
        console.error('Error marking desk free:', error);
        res.status(500).json({ message: 'Server error marking desk free.' });
    }
});

// Initial Admin User Creation (Optional, for easy setup)
// You can run this once to create an admin user manually or via a script.
// For demonstration, let's add a route that can create an admin, use with caution.
app.post('/api/create-admin', async (req, res) => {
    try {
        const { name, mobile, password } = req.body; // In a real app, hash password
        if (!name || !mobile || !password) {
            return res.status(400).json({ message: 'Name, mobile, and password are required.' });
        }
        let adminUser = await User.findOne({ mobile });
        if (adminUser) {
            return res.status(409).json({ message: 'User with this mobile already exists.' });
        }
        // IMPORTANT: In a real app, you'd hash the password here (e.g., using bcrypt)
        adminUser = new User({ name, mobile, role: 'admin' });
        await adminUser.save();
        res.status(201).json({ message: 'Admin user created successfully!', user: adminUser });
    } catch (error) {
        console.error('Error creating admin user:', error);
        res.status(500).json({ message: 'Server error creating admin user.' });
    }
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});