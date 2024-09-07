import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout';
import styles from '../../../styles/RequestOrder.module.css';
import { supabase } from '../../../utils/supabaseClient';

const RequestOrder: React.FC = () => {
  const [itemSelections, setItemSelections] = useState<{ id: number; name: string; quantity: number; unit: string; cost_per_unit: number }[]>([]);
  const [timeline, setTimeline] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [selectedItem, setSelectedItem] = useState<any | null>(null); // Item details when clicked
  const [isConfirmingOrder, setIsConfirmingOrder] = useState(false); // Order confirmation state
  const router = useRouter();
  const { restaurantId } = router.query;

  useEffect(() => {
    const fetchItems = async () => {
      const { data, error } = await supabase
        .from('items')
        .select('*');

      if (error) {
        console.error('Error fetching items:', error.message);
      } else {
        setItems(data || []);
      }
    };

    fetchItems();
  }, []);

  const handleAddToCart = (item: any, quantity: number) => {
    setItemSelections((prevSelections) => {
      const existingItem = prevSelections.find((selection) => selection.id === item.id);
      if (existingItem) {
        return prevSelections.map((selection) =>
          selection.id === item.id ? { ...selection, quantity: quantity } : selection
        );
      } else {
        return [...prevSelections, { id: item.id, name: item.name, quantity, unit: item.unit, cost_per_unit: item.cost_per_unit }];
      }
    });
    const newSubtotal = itemSelections.reduce(
      (sum, selection) => sum + selection.cost_per_unit * selection.quantity,
      0
    );
    setSubtotal(newSubtotal);
  };

  const handleQuantityChange = (itemId: number, quantity: number) => {
    setItemSelections((prevSelections) => {
      const newSelections = prevSelections.map((selection) =>
        selection.id === itemId ? { ...selection, quantity: Math.max(1, quantity) } : selection
      );
      const newSubtotal = newSelections.reduce(
        (sum, selection) => sum + selection.cost_per_unit * selection.quantity,
        0
      );
      setSubtotal(newSubtotal);
      return newSelections;
    });
  };

  const handleSubmitOrder = async () => {
    if (!restaurantId) {
      setError('No restaurant ID found.');
      return;
    }

    if (!isConfirmingOrder) {
      setIsConfirmingOrder(true);
      return;
    }

    const newOrders = itemSelections.map((selection) => ({
      restaurant_id: parseInt(restaurantId as string, 10),
      item_id: selection.id,
      quantity: selection.quantity,
      unit: selection.unit,
      timeline,
      notes,
      status: 'pending',
      flagged: false,
      pending_status: 'not_confirmed',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    const { data, error } = await supabase
      .from('inventory_requests')
      .insert(newOrders)
      .select();

    if (error) {
      console.error('Supabase insert error:', error); 
      setError('Failed to submit the order. Please try again.');
    } else {
      setSuccess('Your order was submitted successfully!');
      setItemSelections([]);
      setTimeline('');
      setNotes('');
      setSubtotal(0);
      setIsConfirmingOrder(false); // Reset confirmation state
    }
  };

  return (
    <Layout>
      <h1 className={styles.header}>Marketplace</h1>

      {/* Marketplace Grid */}
      <div className={styles.gridContainer}>
        {items.map((item) => (
          <div 
            key={item.id} 
            className={styles.itemCard} 
            onClick={() => setSelectedItem(item.id)} 
            role="button"
            tabIndex={0}
            onKeyPress={() => setSelectedItem(item.id)}
          >
            <img src={item.image_link} alt={item.name} className={styles.itemImage} />
            <h2 className={styles.itemName}>{item.name}</h2>
            <p className={styles.itemDescription}>{item.item_description}</p>
            <p className={styles.itemPrice}>${item.cost_per_unit.toFixed(2)} per {item.unit}</p>

            {/* Quantity Selector */}
            <div className={styles.quantityContainer}>
              <input
                type="number"
                min="1"
                value={itemSelections.find((i) => i.id === item.id)?.quantity || 1}
                onClick={(e) => e.stopPropagation()} // Prevent opening item details
                onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
                className={styles.quantityInput}
              />
            </div>

            <button 
              onClick={(e) => {
                e.stopPropagation(); // Prevent triggering item click
                handleAddToCart(item, parseInt(e.target.previousSibling.firstChild.value));
              }} 
              className={styles.addToCartButton}
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>

      {/* Cart Summary */}
      <div className={styles.cartSummary}>
        <h3>Your Cart</h3>
        <ul>
          {itemSelections.map((selection) => (
            <li key={selection.id}>
              {selection.name} - {selection.quantity} {selection.unit} @ ${selection.cost_per_unit.toFixed(2)} each = ${(
                selection.quantity * selection.cost_per_unit
              ).toFixed(2)}
            </li>
          ))}
        </ul>
        <h4>Subtotal: ${subtotal.toFixed(2)}</h4>
        {isConfirmingOrder ? (
          <button onClick={handleSubmitOrder} className={styles.submitOrderButton}>Confirm Order</button>
        ) : (
          <button onClick={handleSubmitOrder} className={styles.submitOrderButton}>Submit Order</button>
        )}
      </div>

      {error && <p className={styles.error}>{error}</p>}
      {success && <p className={styles.success}>{success}</p>}
    </Layout>
  );
};

export default RequestOrder;
