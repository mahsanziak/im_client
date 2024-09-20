import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout';
import styles from '../../../styles/RequestOrder.module.css';
import { supabase } from '../../../utils/supabaseClient';

const RequestOrder: React.FC = () => {
  const [itemSelections, setItemSelections] = useState<
    { id: number; name: string; quantity: number; unit: string; cost_per_unit: number; notes: string }[]
  >([]);
  const [searchTerm, setSearchTerm] = useState(''); // Added for search functionality
  const [timeline, setTimeline] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [subtotal, setSubtotal] = useState(0);
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

  // Filtered items based on search
  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const handleQuantityChangeInCart = (itemId: number, quantity: number) => {
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

    // Ensure that restaurant ID exists in the restaurants table
    const parsedRestaurantId = parseInt(restaurantId as string, 10);
    const { data: restaurantData, error: restaurantError } = await supabase
      .from('restaurants')
      .select('*')
      .eq('id', parsedRestaurantId);

    if (restaurantError || restaurantData.length === 0) {
      setError('Invalid restaurant ID. Please try again.');
      return;
    }

    if (!isConfirmingOrder) {
      setIsConfirmingOrder(true);
      return;
    }

    const newOrders = itemSelections.map((selection) => ({
      restaurant_id: parsedRestaurantId,
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

      {/* Search Bar */}
      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search for items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      <div className={styles.gridContainer}>
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className={styles.itemCard}
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

            <button
              onClick={() => handleAddToCart(item, 1)}
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
              <input
                type="number"
                min="1"
                value={selection.quantity}
                onChange={(e) => handleQuantityChangeInCart(selection.id, parseInt(e.target.value))}
                className={styles.quantityInput}
              />
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

      {/* Extra padding for scroll */}
      <div style={{ height: '2in' }}></div> 
    </Layout>
  );
};

export default RequestOrder;
