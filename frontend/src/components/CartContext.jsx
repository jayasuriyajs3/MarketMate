import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(false);

  // Fetch cart on mount
  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem('mm_token');
      if (!token) return;

      const response = await fetch('http://localhost:5000/api/cart', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setCart(data);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('mm_token');
      const response = await fetch('http://localhost:5000/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId, quantity }),
      });
      if (response.ok) {
        const data = await response.json();
        setCart(data);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error adding to cart:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('mm_token');
      const response = await fetch('http://localhost:5000/api/cart/remove', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId }),
      });
      if (response.ok) {
        const data = await response.json();
        setCart(data);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error removing from cart:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('mm_token');
      const response = await fetch('http://localhost:5000/api/cart/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId, quantity }),
      });
      if (response.ok) {
        const data = await response.json();
        setCart(data);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating quantity:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getTotalItems = () => {
    return cart.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  };

  const getTotalPrice = () => {
    return cart.items?.reduce((sum, item) => {
      const price = item.product?.finalPrice || item.price || 0;
      return sum + price * item.quantity;
    }, 0) || 0;
  };

  const clearCart = async () => {
    try {
      const token = localStorage.getItem('mm_token');
      const response = await fetch('http://localhost:5000/api/cart/clear', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        setCart({ items: [] });
        return true;
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
    return false;
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        getTotalItems,
        getTotalPrice,
        clearCart,
        loading,
        fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
