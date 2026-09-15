import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('rental_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [fulfillmentType, setFulfillmentType] = useState('store_pickup');
  const [deliveryAddress, setDeliveryAddress] = useState(null);

  useEffect(() => {
    localStorage.setItem('rental_cart', JSON.stringify(items));
  }, [items]);

  const addItem = (item) => {
    setItems((prev) => {
      // Check if same product & variant already in cart with matching dates
      const existingIndex = prev.findIndex(
        (i) =>
          i.productId === item.productId &&
          i.variantId === item.variantId &&
          i.rentalStart === item.rentalStart &&
          i.rentalEnd === item.rentalEnd
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity = (updated[existingIndex].quantity || 1) + 1;
        return updated;
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeItem = (index) => {
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem('rental_cart');
  };

  const totalRentalFee = items.reduce((sum, item) => sum + (item.lineRentalFee || 0), 0);
  const totalDeposit = items.reduce((sum, item) => sum + (item.lineDeposit || 0), 0);
  const totalTax = Math.round(totalRentalFee * 0.18 * 100) / 100;
  const grandTotal = totalRentalFee + totalDeposit + totalTax;

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        clearCart,
        totalRentalFee,
        totalDeposit,
        totalTax,
        grandTotal,
        fulfillmentType,
        setFulfillmentType,
        deliveryAddress,
        setDeliveryAddress,
        itemCount: items.length,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
export default CartContext;
