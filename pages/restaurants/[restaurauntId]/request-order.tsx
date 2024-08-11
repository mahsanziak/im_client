import React, { useState, useEffect } from 'react';
import Layout from '../../../components/Layout';
import styles from '../../../styles/RequestOrder.module.css';
import { supabase } from '../../../utils/supabaseClient';

const RequestOrder: React.FC = () => {
  const [itemId, setItemId] = useState(''); // State for item ID
  const [quantity, setQuantity] = useState<number | ''>('');
  const [unit, setUnit] = useState(''); 
  const [timeline, setTimeline] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);

  // Fetch orders and items from the database on component mount
  useEffect(() => {
    const fetchOrders = async () => {
      const { data, error } = await supabase
        .from('inventory_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error.message);
      } else {
        setOrders(data || []);
      }
    };

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

    fetchOrders();
    fetchItems();
  }, []);

  const handleItemChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedItemId = e.target.value;
    setItemId(selectedItemId);

    // Find the unit associated with the selected item
    const selectedItemData = items.find((item) => item.id === parseInt(selectedItemId));
    if (selectedItemData) {
      setUnit(selectedItemData.unit);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const numericQuantity = typeof quantity === 'string' ? parseInt(quantity, 10) : quantity;

    if (numericQuantity <= 0 || !numericQuantity) {
      setError('Quantity must be greater than 0');
      return;
    }

    if (!unit) {
      setError('Please select an item to determine the unit');
      return;
    }

    setError(null);

    const newOrder = {
      restaurant_id: 1, // Example restaurant_id, you can replace it with the actual selected one
      item_id: parseInt(itemId, 10),
      quantity: numericQuantity,
      unit, 
      timeline,
      notes,
      status: 'pending',
      flagged: false,
      pending_status: 'not_confirmed',
      cutoff_time: null, // Adjust as needed
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Insert and return the inserted data
    const { data, error } = await supabase
      .from('inventory_requests')
      .insert([newOrder])
      .select(); // This will return the inserted rows

    if (error) {
      console.error('Supabase insert error:', error); 
      setError('Failed to submit the request. Please try again.');
    } else {
      setSuccess('Request submitted successfully!');
      if (data && data.length > 0) {
        setOrders([data[0], ...orders]);
      }
      setItemId(''); 
      setQuantity('');
      setUnit(''); 
      setTimeline('');
      setNotes('');
    }
  };

  return (
    <Layout>
      <h1 className={styles.header}>Request Order</h1>
      <p className={styles.description}>Fill out the form below to request the supplies you need.</p>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="itemId" className={styles.label}>
            Item Name <span className={styles.required}>*</span>
          </label>
          <select
            id="itemId"
            className={styles.select}
            value={itemId}
            onChange={handleItemChange}
            required
          >
            <option value="" disabled>Select an item</option>
            {items.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="quantity" className={styles.label}>
            Item Quantity <span className={styles.required}>*</span>
          </label>
          <input
            type="number"
            id="quantity"
            className={styles.input}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value ? parseInt(e.target.value, 10) : '')}
            min="1"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="unit" className={styles.label}>
            Unit
          </label>
          <input
            type="text"
            id="unit"
            className={styles.input}
            value={unit}
            readOnly
          />
        </div>

        {error && <p className={styles.error}>{error}</p>}
        {success && <p className={styles.success}>{success}</p>}

        <div className={styles.formGroup}>
          <label htmlFor="timeline" className={styles.label}>
            Timeline (optional)
          </label>
          <input
            type="text"
            id="timeline"
            className={styles.input}
            value={timeline}
            onChange={(e) => setTimeline(e.target.value)}
            placeholder="e.g., ASAP, within a week"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="notes" className={styles.label}>
            Notes (optional)
          </label>
          <textarea
            id="notes"
            className={styles.textarea}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any additional notes here"
          ></textarea>
        </div>

        <button type="submit" className={styles.submitButton}>Submit Request</button>
      </form>

      <h2 className={styles.ordersHeader}>Orders Sent</h2>
      <ul className={styles.ordersList}>
        {orders.map((order) => (
          <li key={order.id} className={styles.orderItem}>
            <div>
              <strong>{order.item_id}</strong> - Quantity: {order.quantity} {order.unit} - Timeline: {order.timeline}
            </div>
            <div>Date: {order.created_at.split('T')[0]}</div>
          </li>
        ))}
      </ul>
    </Layout>
  );
};

export default RequestOrder;
