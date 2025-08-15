import React, { useEffect, useState, useCallback, useRef } from 'react';

// This is a stand-in for a better way to handle messages without 'alert'
const MessageBox = ({ message, type, onClose }) => {
    if (!message) return null;

    const colorClasses = {
        success: "message-box-success",
        error: "message-box-error",
        info: "message-box-info"
    };

    return (
        <div className={`message-box ${colorClasses[type]}`}>
            <p>{message}</p>
            <button onClick={onClose} className="message-box-close">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            </button>
        </div>
    );
};

// Backend API URL
const API_BASE_URL = 'http://localhost:5000/api';

const AdminPanel = () => {
    const [allOrders, setAllOrders] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [adminMobileInput, setAdminMobileInput] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [message, setMessage] = useState({ text: '', type: 'info' });
    const [dynamicAdminLog, setDynamicAdminLog] = useState([]);

    // Use useRef to store previous state without triggering re-renders
    const prevOrdersRef = useRef([]);
    const prevUsersRef = useRef([]);

    // Helper function to add new messages to the log with a timestamp
    const logMessage = useCallback((text) => {
        const timestamp = new Date().toLocaleString();
        setDynamicAdminLog(prevLog => [...prevLog, `${timestamp} - ${text}`]);
    }, []);

    // Function to show a message and clear it after a delay
    const showMessage = useCallback((text, type = 'info') => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 5000);
    }, []);

    // Function to fetch all orders
    const fetchAllOrders = useCallback(async () => {
        if (!isAuthenticated || !adminMobileInput) return;
        try {
            const response = await fetch(`${API_BASE_URL}/admin/orders`, {
                headers: {
                    'x-admin-mobile': adminMobileInput
                }
            });
            if (response.ok) {
                const data = await response.json();
                setAllOrders(data);
                showMessage('Orders list updated successfully.', 'success');

                // Check for new orders and log them
                const newOrders = data.filter(order => !prevOrdersRef.current.some(prevOrder => prevOrder._id === order._id));
                if (newOrders.length > 0) {
                    newOrders.forEach(order => {
                        logMessage(`New order placed for Desk ${order.deskNumber} by user ${order.customerName}.`);
                    });
                }
                prevOrdersRef.current = data;
            } else {
                const errorData = await response.json();
                console.error('Failed to fetch orders:', errorData.message);
                setAllOrders([]);
                showMessage(`Failed to fetch orders: ${errorData.message}`, 'error');
                logMessage(`Failed to fetch orders: ${errorData.message}`);
            }
        } catch (error) {
            console.error('Error fetching all orders:', error);
            setAllOrders([]);
            showMessage('An error occurred while fetching orders.', 'error');
            logMessage('Error occurred while` fetching orders.');
        }
    }, [isAuthenticated, adminMobileInput, showMessage, logMessage]);

    // Function to fetch all users
    const fetchAllUsers = useCallback(async () => {
        if (!isAuthenticated || !adminMobileInput) return;
        try {
            const response = await fetch(`${API_BASE_URL}/admin/users`, {
                headers: {
                    'x-admin-mobile': adminMobileInput
                }
            });
            if (response.ok) {
                const data = await response.json();
                setAllUsers(data);
                showMessage('Users list updated successfully.', 'success');

                // Check for new users and log them
                const newUsers = data.filter(user => !prevUsersRef.current.some(prevUser => prevUser._id === user._id));
                if (newUsers.length > 0) {
                    newUsers.forEach(user => {
                        logMessage(`New user ${user.name} checked in with mobile number ${user.mobile}.`);
                    });
                }
                prevUsersRef.current = data;
            } else {
                const errorData = await response.json();
                console.error('Failed to fetch users:', errorData.message);
                setAllUsers([]);
                showMessage(`Failed to fetch users: ${errorData.message}`, 'error');
                logMessage(`Failed to fetch users: ${errorData.message}`);
            }
        } catch (error) {
            console.error('Error fetching all users:', error);
            setAllUsers([]);
            showMessage('An error occurred while fetching users.', 'error');
            logMessage('Error occurred while fetching users.');
        }
    }, [isAuthenticated, adminMobileInput, showMessage, logMessage]);

    // Function to mark desk as free
    const handleFreeDesk = useCallback(async (deskNumber) => {
        if (!isAuthenticated || !adminMobileInput) return;
        try {
            const response = await fetch(`${API_BASE_URL}/admin/free-desk`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-mobile': adminMobileInput
                },
                body: JSON.stringify({ deskNumber })
            });
            if (response.ok) {
                showMessage(`Desk ${deskNumber} marked as free!`, 'success');
                logMessage(`Desk ${deskNumber} marked as free.`);
                fetchAllOrders();
            } else {
                const errorData = await response.json();
                showMessage(`Failed to free desk: ${errorData.message}`, 'error');
                logMessage(`Failed to free desk: ${errorData.message}`);
            }
        } catch (error) {
            console.error('Error marking desk free:', error);
            showMessage('An error occurred while marking desk free.', 'error');
            logMessage('Error marking desk free.');
        }
    }, [isAuthenticated, adminMobileInput, fetchAllOrders, showMessage, logMessage]);

    // Simple Admin authentication for demo
    const handleAdminLogin = async () => {
        if (adminMobileInput === '9573362314') {
            setIsAuthenticated(true);
            showMessage('Admin login successful! Now fetching data...', 'success');
            logMessage('Admin logged in.');
            // Initial data fetch after successful login
            fetchAllOrders();
            fetchAllUsers();
        } else {
            showMessage('Invalid Admin Number', 'error');
            setIsAuthenticated(false);
            logMessage('Failed admin login attempt.');
        }
    };


    useEffect(() => {
        if (isAuthenticated) {
         
            fetchAllOrders();
            fetchAllUsers();
        }
    }, [isAuthenticated, fetchAllOrders, fetchAllUsers]);

    if (!isAuthenticated) {
        return (
            <div className="login-container">
                <div className="login-card">
                    <div className="login-header">
                        <h2>Admin Login</h2>
                        <p>Enter Admin Mobile Number to access.</p>
                    </div>
                    <MessageBox message={message.text} type={message.type} onClose={() => setMessage({ text: '' })} />
                    <form onSubmit={(e) => { e.preventDefault(); handleAdminLogin(); }}>
                        <div className="input-group">
                            <div className="input-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon small"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                            </div>
                            <input
                                type="tel"
                                placeholder="Admin Mobile Number"
                                value={adminMobileInput}
                                onChange={(e) => setAdminMobileInput(e.target.value)}
                                className="login-input"
                                maxLength="10"
                                pattern="\d{10}"
                                required
                            />
                        </div>
                        <button type="submit" className="login-button">
                            Login as Admin
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-panel-container">
            <h2 className="admin-panel-heading">🎮 Game Zone Admin Panel ⚙️</h2>

            <MessageBox message={message.text} type={message.type} onClose={() => setMessage({ text: '' })} />

            {/* Admin Overview / Statistics */}
            <div className="stats-grid">
                <div className="stat-card">
                    <h3 className="stat-label">Total Users</h3>
                    <p className="stat-value">{allUsers.length}</p>
                </div>
                <div className="stat-card">
                    <h3 className="stat-label">Active Sessions</h3>
                    <p className="stat-value">{allOrders.filter(order => order.status === 'active').length}</p>
                </div>
                <div className="stat-card">
                    <h3 className="stat-label">Total Revenue (Checked Out)</h3>
                    <p className="stat-value">₹{allOrders.filter(order => order.status === 'checked_out').reduce((sum, order) => sum + order.totalAmount, 0)}</p>
                </div>
            </div>

            <hr className="divider" />

            <div className="panel-section">
                <h3 className="section-heading">👥 All Users</h3>
                <div className="table-responsive">
                    <table className="data-table">
                        <thead className="table-header">
                            <tr>
                                <th scope="col" className="table-header-cell">Name</th>
                                <th scope="col" className="table-header-cell">Mobile</th>
                                <th scope="col" className="table-header-cell">Role</th>
                                <th scope="col" className="table-header-cell">Joined On</th>
                            </tr>
                        </thead>
                        <tbody className="table-body">
                            {allUsers.length > 0 ? (
                                allUsers.map(user => (
                                    <tr key={user._id} className="table-row">
                                        <td className="table-cell">{user.name}</td>
                                        <td className="table-cell">{user.mobile}</td>
                                        <td className="table-cell">{user.role}</td>
                                        <td className="table-cell">{new Date(user.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="4" className="table-cell-empty">No users found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <hr className="divider" />

            <div className="panel-section">
                <h3 className="section-heading">📝 All Orders (Active & Checked Out)</h3>
                <div className="table-responsive">
                    <table className="data-table">
                        <thead className="table-header">
                            <tr>
                                <th scope="col" className="table-header-cell">Desk</th>
                                <th scope="col" className="table-header-cell">Customer</th>
                                <th scope="col" className="table-header-cell">Items</th>
                                <th scope="col" className="table-header-cell">Total</th>
                                <th scope="col" className="table-header-cell">Status</th>
                                <th scope="col" className="table-header-cell">Order Time</th>
                                <th scope="col" className="table-header-cell">Checkout Time</th>
                                <th scope="col" className="table-header-cell">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="table-body">
                            {allOrders.length > 0 ? (
                                allOrders.map(order => (
                                    <tr key={order._id} className="table-row">
                                        <td className="table-cell">{order.deskNumber}</td>
                                        <td className="table-cell">{order.customerName} ({order.customerMobile})</td>
                                        <td className="table-cell">
                                            {order.items.map((item, index) => (
                                                <span key={`${item.productId}-${index}`} className="block">{item.name} (x{item.quantity})</span>
                                            ))}
                                        </td>
                                        <td className="table-cell">₹{order.totalAmount}</td>
                                        <td className={`table-cell font-medium capitalize ${order.status === 'active' ? 'status-active' : 'status-checked-out'}`}>
                                            {order.status.replace('_', ' ')}
                                        </td>
                                        <td className="table-cell">{new Date(order.orderTime).toLocaleString()}</td>
                                        <td className="table-cell">{order.checkoutTime ? new Date(order.checkoutTime).toLocaleString() : 'N/A'}</td>
                                        <td className="table-cell">
                                            {order.status === 'active' && (
                                                <button
                                                    className="free-desk-button"
                                                    onClick={() => handleFreeDesk(order.deskNumber)}
                                                >
                                                    Mark Desk Free
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="8" className="table-cell-empty">No orders found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <hr className="divider" />

            <div className="panel-section">
                <h3 className="section-heading">🪵 Frontend Log (for debugging/monitoring)</h3>
                <div className="log-box">
                    {dynamicAdminLog.length === 0 ? <p className="log-item">[No frontend logs yet]</p> :
                        [...dynamicAdminLog].reverse().map((log, index) => (
                            <p key={`${log}-${index}`} className="log-item">➡️ {log}</p>
                        ))
                    }
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;
