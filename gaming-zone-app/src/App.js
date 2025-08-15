import React, { useState, createContext, useContext, useMemo, useEffect, useCallback } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import './App.css';
import AdminPanel from './AdminPanel'; // AdminPanel will be modified too

// --- ICONS (using inline SVG for simplicity) ---
const GamepadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon"><path d="M16.5 12h-9" /><path d="M12 16.5v-9" /><path d="M7.5 12a4.5 4.5 0 0 1 4.5-4.5v0A4.5 4.5 0 0 1 16.5 12a4.5 4.5 0 0 1-4.5 4.5v0A4.5 4.5 0 0 1 7.5 12Z" /><path d="M12 12h.01" /></svg>;
const CoffeeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon"><path d="M10 2v2" /><path d="M14 2v2" /><path d="M16 8a1 1 0 0 1 1 1v2a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v2" /><path d="M8 21h8" /><path d="M12 17v4" /></svg>;
const ShoppingCartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon"><circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" /></svg>;
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon small"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>;
const PhoneIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon small"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon trash"><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>;
const LogoutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon small"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>;
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon large-success"><path d="M22 11.08V12a10 10 0 1 1-5.93-8.15"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;

// Backend API URL
const API_BASE_URL = 'http://localhost:5000/api'; // Change if your backend runs on a different port/host

// --- MOCK DATA (for products, will still be in frontend) ---
const MOCK_PRODUCTS = [
    { id: 1, name: 'PS5 - 1 Hour', price: 250, category: 'gaming', img: '🎮' },
    { id: 2, name: 'PS4 - 1 Hour', price: 150, category: 'gaming', img: '🕹️' },
    { id: 3, name: 'VR Experience - 30 Mins', price: 400, category: 'gaming', img: '🕶️' },
    { id: 4, name: 'Racing Simulator - 15 Mins', price: 300, category: 'gaming', img: '🏎️' },
    { id: 5, name: 'Cola', price: 60, category: 'cafe', img: '🥤' },
    { id: 6, name: 'Fries', price: 120, category: 'cafe', img: '🍟' },
    { id: 7, name: 'Pizza Slice', price: 180, category: 'cafe', img: '🍕' },
    { id: 8, name: 'Coffee', price: 100, category: 'cafe', img: '☕' },
];

// --- CONTEXT ---
export const AppContext = createContext();

// --- COMPONENTS (ProductCard, Cart, LoginPage, DashboardPage, DeskSelectionPage, OrderConfirmationPage) ---
// These components need to be aware of the new backend interaction.

function ProductCard({ product }) {
    const { addToCart } = useContext(AppContext);
    return (
        <div className="product-card">
            <div className="product-card-img">{product.img}</div>
            <h3 className="product-card-name">{product.name}</h3>
            <p className="product-card-price">₹{product.price}</p>
            <button
                onClick={() => addToCart(product)}
                className="product-card-button"
            >
                Add
            </button>
        </div>
    );
}

function Cart() {
    const { cart, removeFromCart, placeOrder, total, orderStatus } = useContext(AppContext);

    if (cart.length === 0 && orderStatus !== 'confirmed') {
        return (
            <div className="cart-empty">
                <ShoppingCartIcon />
                <p>Your cart is empty.</p>
                <p className="small-text">Add items from the menu.</p>
            </div>
        );
    }

    if (orderStatus === 'confirmed') {
        return (
            <div className="order-confirmed">
                <h3>Order Placed! ✅</h3>
                <p>We are preparing your order. Enjoy your game!</p>
                <p className="small-text">You can add more items if you wish.</p>
            </div>
        );
    }

    return (
        <div className="cart-container">
            <h2 className="cart-header"><ShoppingCartIcon /> <span>Your Order</span></h2>
            <div className="cart-items">
                {cart.map(item => (
                    <div key={item.productId} className="cart-item">
                        <div>
                            <p className="cart-item-name">{item.name}</p>
                            <p className="cart-item-quantity">x{item.quantity}</p>
                        </div>
                        <div className="cart-item-details">
                            <p className="cart-item-price">₹{item.price * item.quantity}</p>
                            <button onClick={() => removeFromCart(item.id)} className="cart-remove-button">
                                <TrashIcon />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            <div className="cart-summary">
                <div className="cart-total">
                    <span>Total:</span>
                    <span>₹{total}</span>
                </div>
                <button
                    onClick={placeOrder}
                    disabled={cart.length === 0}
                    className="place-order-button"
                >
                    Place Order
                </button>
            </div>
        </div>
    );
}

function LoginPage() {
    const { selectedDesk, handleLogin } = useContext(AppContext);
    const [name, setName] = useState('');
    const [mobile, setMobile] = useState('');

    const onLoginSubmit = async (e) => { // Made async
        e.preventDefault();
        if (name && mobile.length === 10) {
            await handleLogin({ name, mobile }); // Await the login call
        } else {
            alert("Please enter a valid name and 10-digit mobile number.");
        }
    };

    return (
        <div className="login-page-container">
            <div className="login-form-card">
                <div className="login-header">
                    <h1>Welcome to Desk {selectedDesk}</h1>
                    <p>Log in to start your session.</p>
                </div>
                <form onSubmit={onLoginSubmit}>
                    <div className="login-form-group">
                        <div className="input-wrapper">
                            <div className="input-icon">
                                <UserIcon />
                            </div>
                            <input
                                type="text"
                                placeholder="Your Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="login-input"
                                required
                            />
                        </div>
                        <div className="input-wrapper">
                            <div className="input-icon">
                                <PhoneIcon />
                            </div>
                            <input
                                type="tel"
                                placeholder="10-Digit Mobile Number"
                                value={mobile}
                                onChange={(e) => setMobile(e.target.value)}
                                maxLength="10"
                                pattern="\d{10}"
                                className="login-input"
                                required
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="login-button"
                    >
                        Start Gaming
                    </button>
                </form>
            </div>
        </div>
    );
}

function DashboardPage() {
    const { user, selectedDesk, checkout, changeDesk, loadActiveOrderForUser } = useContext(AppContext);
    const gamingProducts = MOCK_PRODUCTS.filter(p => p.category === 'gaming');
    const cafeProducts = MOCK_PRODUCTS.filter(p => p.category === 'cafe');

    useEffect(() => {
        if (user && user.mobile && selectedDesk) {
            loadActiveOrderForUser(user.mobile);
        }
    }, [user, selectedDesk, loadActiveOrderForUser]); // Depend on user, selectedDesk, loadActiveOrderForUser

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div>
                    <h1>Desk {selectedDesk}</h1>
                    <p>Welcome, {user.name}!</p>
                </div>
                <div className="header-buttons">
                    <button
                        onClick={changeDesk}
                        className="change-desk-button"
                    >
                        <LogoutIcon /> Change Desk
                    </button>
                    <button
                        onClick={checkout}
                        className="checkout-button"
                    >
                        Checkout & Pay
                    </button>
                </div>
            </header>

            <div className="dashboard-content">
                <div className="main-content">
                    <div>
                        <h2 className="section-title"><GamepadIcon /> Gaming Menu</h2>
                        <div className="product-grid">
                            {gamingProducts.map(p => <ProductCard key={p.id} product={p} />)}
                        </div>
                    </div>
                    <div>
                        <h2 className="section-title"><CoffeeIcon /> Café Menu</h2>
                        <div className="product-grid">
                            {cafeProducts.map(p => <ProductCard key={p.id} product={p} />)}
                        </div>
                    </div>
                </div>

                <div className="cart-sidebar">
                    <div className="sticky-cart">
                        <Cart />
                    </div>
                </div>
            </div>
        </div>
    );
}

function DeskSelectionPage() {
    const { handleDeskSelect } = useContext(AppContext);
    const desks = [1, 2, 3, 4, 5, 6];

    return (
        <div className="desk-selection-container">
            <div className="desk-selection-header">
                <h1>Gaming Zone</h1>
                <p>Select Your Desk</p>
            </div>
            <div className="desk-grid">
                {desks.map(deskNum => (
                    <button
                        key={deskNum}
                        onClick={() => handleDeskSelect(deskNum)}
                        className="desk-button"
                    >
                        <span>Desk</span>
                        <span>{deskNum}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}

function OrderConfirmationPage() {
    const { user, selectedDesk, lastBillTotal, navigate } = useContext(AppContext);

    useEffect(() => {
        const timer = setTimeout(() => {
            navigate('/');
        }, 5000);

        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div className="order-confirmation-container">
            <div className="order-confirmation-card">
                <CheckCircleIcon />
                <h2>Thank You for Your Order, {user?.name || 'Customer'}!</h2>
                {selectedDesk && <p>Your session at **Desk {selectedDesk}** has ended.</p>}
                {lastBillTotal !== null && (
                    <p className="final-bill">Final Bill: **₹{lastBillTotal}**</p>
                )}
                <p>We hope you had a great time!</p>
                <p className="redirect-message">Redirecting to desk selection in a few seconds...</p>
                <Link to="/" className="back-to-home-button">Go to Desk Selection Now</Link>
            </div>
        </div>
    );
}

// --- Main App Component ---
export default function App() {
    const [selectedDesk, setSelectedDesk] = useState(null);
    const [user, setUser] = useState(null);
    const [cart, setCart] = useState([]);
    const [orderStatus, setOrderStatus] = useState('pending'); // 'pending', 'confirmed'
    const [adminLog, setAdminLog] = useState([]); // Still for frontend display, backend has its own logs
    const [lastBillTotal, setLastBillTotal] = useState(null);
    const navigate = useNavigate();

    // Use useCallback for functions passed as dependencies to useEffect
    const handleLogin = useCallback(async ({ name, mobile }) => {
        try {
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, mobile, deskNumber: selectedDesk }) // Send deskNumber
            });
            const data = await response.json();

            if (response.ok) {
                setUser(data.user);
                setAdminLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] User '${data.user.name}' logged into Desk ${selectedDesk}`]);
                // If there was an active order, load its cart
                if (data.activeOrder) {
                    setCart(data.activeOrder.items);
                    setOrderStatus('confirmed'); // Assuming if an active order exists, it was previously placed
                } else {
                    setCart([]); // New session, empty cart
                    setOrderStatus('pending');
                }
                navigate('/dashboard');
            } else {
                alert(`Login failed: ${data.message}`);
            }
        } catch (error) {
            console.error('Frontend Login API error:', error);
            alert('An error occurred during login. Please try again.');
        }
    }, [selectedDesk, navigate]); // selectedDesk and navigate are stable

    const loadActiveOrderForUser = useCallback(async (mobile) => {
        try {
            const response = await fetch(`${API_BASE_URL}/user-active-order/${mobile}`);
            const data = await response.json();
            if (response.ok && data.order) {
                setCart(data.order.items);
                setOrderStatus('confirmed'); // Assuming if loaded, it's a confirmed order
            } else {
                setCart([]);
                setOrderStatus('pending');
            }
        } catch (error) {
            console.error('Error loading active order:', error);
            // Optionally handle error for user, but silently fail is fine here
        }
    }, []); // No dependencies for this useCallback

    const handleDeskSelect = useCallback((deskNum) => {
        setSelectedDesk(deskNum);
        setAdminLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Customer selected Desk ${deskNum}`]);
        navigate('/login');
    }, [navigate]); // navigate is stable

    const changeDesk = useCallback(() => {
        setAdminLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] User '${user?.name || "Unknown"}' left Desk ${selectedDesk}`]);
        setUser(null);
        setSelectedDesk(null);
        setCart([]);
        setOrderStatus('pending');
        setLastBillTotal(null);
        navigate('/');
    }, [user, selectedDesk, navigate]); // Dependencies for changeDesk

// In src/App.js
const addToCart = useCallback((product) => {
    setOrderStatus('pending');
    setCart(prevCart => {
        const existingItem = prevCart.find(item => item.id === product.id); // Still check by product.id
        if (existingItem) {
            // If item exists, update its quantity. The existing item already has productId.
            return prevCart.map(item =>
                item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
            );
        }
        // For new items, map product.id to productId for the backend schema
        return [...prevCart, {
            productId: product.id, // <-- Add this line
            name: product.name,
            price: product.price,
            quantity: 1
            // You can also spread like this: ...product, productId: product.id, id: undefined if you want to remove 'id'
            // For simplicity, defining properties explicitly is clearer here
        }];
    });
}, []);

    const removeFromCart = useCallback((productId) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.id === productId);
            if (existingItem.quantity === 1) {
                return prevCart.filter(item => item.id !== productId);
            }
            return prevCart.map(item => item.id === productId ? { ...item, quantity: item.quantity - 1 } : item);
        });
    }, []);

    const total = useMemo(() => {
        return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    }, [cart]);

    const placeOrder = useCallback(async () => {
        if (cart.length === 0 || !user || !selectedDesk) {
            alert("Cart is empty or user/desk not selected.");
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    deskNumber: selectedDesk,
                    customerName: user.name,
                    customerMobile: user.mobile,
                    items: cart,
                    totalAmount: total
                })
            });
            const data = await response.json();

            if (response.ok) {
                setOrderStatus('confirmed');
                setAdminLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Desk ${selectedDesk} placed order: ${data.order.items.map(item => `${item.name} (x${item.quantity})`).join(', ')} | Total: ₹${data.order.totalAmount}`]);
                alert('Order placed successfully!');
            } else {
                alert(`Failed to place order: ${data.message}`);
            }
        } catch (error) {
            console.error('Frontend Place Order API error:', error);
            alert('An error occurred while placing your order. Please try again.');
        }
    }, [cart, user, selectedDesk, total]); // Dependencies for placeOrder

    const checkout = useCallback(async () => {
        if (!user || !selectedDesk) {
            alert("User or desk not selected for checkout.");
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/checkout`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    deskNumber: selectedDesk,
                    customerMobile: user.mobile
                })
            });
            const data = await response.json();

            if (response.ok) {
                const finalTotal = total; // Capture current total before cart clears
                setLastBillTotal(finalTotal);

                setAdminLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Desk ${selectedDesk} checked out. Final Bill: ₹${finalTotal}. Desk is now FREE.`]);

                navigate('/order-confirmed');

                // Reset state after a short delay to allow confirmation page to render
                setTimeout(() => {
                    setUser(null);
                    setSelectedDesk(null);
                    setCart([]);
                    setOrderStatus('pending');
                }, 50);

            } else {
                alert(`Checkout failed: ${data.message}`);
            }
        } catch (error) {
            console.error('Frontend Checkout API error:', error);
            alert('An error occurred during checkout. Please try again.');
        }
    }, [user, selectedDesk, total, navigate]); // Dependencies for checkout


    const contextValue = useMemo(() => ({
        user,
        selectedDesk,
        cart,
        addToCart,
        removeFromCart,
        placeOrder,
        checkout,
        total,
        orderStatus,
        adminLog, // Still passed for frontend admin panel display, but main data comes from backend
        handleLogin,
        handleDeskSelect,
        changeDesk,
        lastBillTotal,
        navigate,
        loadActiveOrderForUser // Add to context
    }), [user, selectedDesk, cart, total, orderStatus, adminLog, lastBillTotal, navigate,
        addToCart, removeFromCart, placeOrder, checkout, handleLogin, handleDeskSelect, changeDesk, loadActiveOrderForUser]);

    return (
        <AppContext.Provider value={contextValue}>
            <div className="app-container">
                <nav className="main-nav">
                    <Link to="/">Home (Desk Select)</Link>
                    {user && <Link to="/dashboard">Dashboard</Link>}
                    <Link to="/admin">Admin Panel</Link>
                </nav>

                <Routes>
                    <Route path="/" element={<DeskSelectionPage />} />
                    <Route path="/login" element={selectedDesk ? <LoginPage /> : <DeskSelectionPage />} />
                    <Route path="/dashboard" element={user && selectedDesk ? <DashboardPage /> : <DeskSelectionPage />} />
                    <Route path="/admin" element={<AdminPanel />} />
                    <Route path="/order-confirmed" element={<OrderConfirmationPage />} />
                    <Route path="*" element={<DeskSelectionPage />} />
                </Routes>
            </div>
        </AppContext.Provider>
    );
}