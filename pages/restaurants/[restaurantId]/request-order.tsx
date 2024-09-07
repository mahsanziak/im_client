import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout';
import styles from '../../../styles/RequestOrder.module.css';
import { supabase } from '../../../utils/supabaseClient';

const RequestOrder: React.FC = () => {
  const [itemSelections, setItemSelections] = useState<
    { id: number; name: string; quantity: number; unit: string; cost_per_unit: number; notes: string }[]
  >([]);
  const [timeline, setTimeline] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [isConfirmingOrder, setIsConfirmingOrder] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const router = useRouter();
  const { restaurantId } = router.query;

  useEffect(() => {
    const fetchItems = async () => {
      const { data, error } = await supabase.from('items').select('*');

      if (error) {
        console.error('Error fetching items:', error.message);
      } else {
        setItems(data || []);
      }
    };

    fetchItems();
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        hour: 'numeric',
        minute: 'numeric',
      };
      setCurrentTime(new Date().toLocaleString('en-US', { ...options, timeZone: 'America/Edmonton' }));
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Calculate the subtotal whenever itemSelections changes
    const newSubtotal = itemSelections.reduce(
      (sum, selection) => sum + selection.cost_per_unit * selection.quantity,
      0
    );
    setSubtotal(newSubtotal);
  }, [itemSelections]);

  const handleAddToCart = (item: any, quantity: number) => {
    setItemSelections((prevSelections) => {
      const existingItem = prevSelections.find((selection) => selection.id === item.id);
      if (existingItem) {
        return prevSelections.map((selection) =>
          selection.id === item.id ? { ...selection, quantity: quantity } : selection
        );
      } else {
        return [
          ...prevSelections,
          { id: item.id, name: item.name, quantity, unit: item.unit, cost_per_unit: item.cost_per_unit, notes: '' },
        ];
      }
    });
  };

  const handleQuantityChange = (itemId: number, quantity: number) => {
    setItemSelections((prevSelections) => {
      return prevSelections.map((selection) =>
        selection.id === itemId ? { ...selection, quantity: Math.max(1, quantity) } : selection
      );
    });
  };

  const handleNoteChange = (itemId: number, note: string) => {
    setItemSelections((prevSelections) => {
      return prevSelections.map((selection) =>
        selection.id === itemId ? { ...selection, notes: note } : selection
      );
    });
  };

  const handleRemoveFromCart = (itemId: number) => {
    setItemSelections((prevSelections) => {
      return prevSelections.filter((selection) => selection.id !== itemId);
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
      notes: selection.notes,
      status: 'pending',
      flagged: false,
      pending_status: 'not_confirmed',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    const { data, error } = await supabase.from('inventory_requests').insert(newOrders).select();

    if (error) {
      console.error('Supabase insert error:', error);
      setError('Failed to submit the order. Please try again.');
    } else {
      setSuccess('Your order was submitted successfully!');
      setItemSelections([]);
      setTimeline('');
      setSubtotal(0);
      setIsConfirmingOrder(false);
    }
  };

  const formatCutOffTime = (day: string, time: string) => {
    const formattedTime = new Date(`1970-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
    });
    return `${day} at ${formattedTime}`;
  };

  return (
    <Layout>
      <div className={styles.headerContainer}>
        <div className={styles.currentTime}>{currentTime}</div>
        <h1 className={styles.header}>Marketplace</h1>
      </div>

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
            <p className={styles.itemPrice}>
              ${item.cost_per_unit.toFixed(2)} per {item.unit}
            </p>
            <p className={styles.cutOff}>
              Cut-Off: {formatCutOffTime(item.cut_off_day, item.cut_off_time)}
            </p>

            <div className={styles.quantityContainer}>
              <input
                type="number"
                min="1"
                value={itemSelections.find((i) => i.id === item.id)?.quantity || 1}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
                className={styles.quantityInput}
              />
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAddToCart(item, parseInt(e.target.previousSibling.firstChild.value));
              }}
              className={styles.addToCartButton}
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>

      <div className={styles.cartSummary}>
        <h3>Your Cart</h3>
        <ul>
          {itemSelections.map((selection) => (
            <li key={selection.id} className={styles.cartItem}>
              <button
                className={styles.removeButton}
                onClick={() => handleRemoveFromCart(selection.id)}
              >
                X
              </button>
              {selection.name} - {selection.quantity} {selection.unit} @ ${selection.cost_per_unit.toFixed(2)} each = $
              {(selection.quantity * selection.cost_per_unit).toFixed(2)}
              <textarea
                placeholder="Add notes for this item"
                value={selection.notes}
                onChange={(e) => handleNoteChange(selection.id, e.target.value)}
                className={styles.notesInput}
              />
            </li>
          ))}
        </ul>
        <h4>Subtotal: ${subtotal.toFixed(2)}</h4>
        {isConfirmingOrder ? (
          <button onClick={handleSubmitOrder} className={styles.submitOrderButton}>
            Confirm Order
          </button>
        ) : (
          <button onClick={handleSubmitOrder} className={styles.submitOrderButton}>
            Submit Order
          </button>
        )}
      </div>

      {error && <p className={styles.error}>{error}</p>}
      {success && <p className={styles.success}>{success}</p>}
    </Layout>
  );
};

export default RequestOrder;
