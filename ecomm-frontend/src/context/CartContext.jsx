import { createContext, useState, useContext, useEffect } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
    const [cart, setCart] = useState(() => {
        const userId = localStorage.getItem('userId');
        if (!userId) return [];
        try {
            const saved = localStorage.getItem(`cart_${userId}`);
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    useEffect(() => {
        const userId = localStorage.getItem('userId');
        if (userId) {
            localStorage.setItem(`cart_${userId}`, JSON.stringify(cart));
        }
    }, [cart]);

    // Persist cart to localStorage whenever it changes
    useEffect(() => {
        try {
            localStorage.setItem("cart", JSON.stringify(cart));
        } catch (error) {
            console.error("Failed to save cart to localStorage:", error);
        }
    }, [cart]);

    // Add product to cart (increases quantity if already exists)
    const addToCart = (product) => {
        setCart((prev) => {
            const exists = prev.find((item) => item.id === product.id);

            if (exists) {
                return prev.map((item) =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }

            return [...prev, { ...product, quantity: 1 }];
        });
    };

    // Remove product completely from cart
    const removeFromCart = (id) => {
        setCart((prev) => prev.filter((item) => item.id !== id));
    };

    // Update quantity of a specific item
    const updateQuantity = (id, newQuantity) => {
        if (newQuantity < 1) return; // Prevent going below 1

        setCart((prev) =>
            prev.map((item) =>
                item.id === id
                    ? { ...item, quantity: newQuantity }
                    : item
            )
        );
    };

    // NEW: Clear entire cart (used after successful payment)
    const clearCart = () => {
        setCart([]);
        localStorage.removeItem("cart"); // Also clear storage
    };

    // Helper: Total number of items (for badge)
    const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);

    // Helper: Total price (for checkout summary)
    const totalPrice = cart.reduce((sum, item) => {
        const price = Number(item.suggestedPrice ?? item.originalPrice ?? 0);
        return sum + price * (item.quantity || 1);
    }, 0);

    return (
        <CartContext.Provider
            value={{
                cart,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,          // ← Now available everywhere
                totalItems,
                totalPrice,         // ← Useful in Cart page
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart must be used inside CartProvider");
    }
    return context;
};