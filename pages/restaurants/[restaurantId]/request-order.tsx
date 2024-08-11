import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout';
import styles from '../../../styles/RequestOrder.module.css';
import { supabase } from '../../../utils/supabaseClient';

const RequestOrder: React.FC = () => {
  const [itemSelections, setItemSelections] = useState<{ id: number; name: string; quantity: number }[]>([]);
  const [timeline, setTimeline] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [items, setItems] = useState<any[]>([]);

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

  const handleItemChange = (itemId: number, itemName: string, checked: boolean) => {
    setItemSelections((prevSelections) => {
      if (checked) {
        return [...prevSelections, { id: itemId, name: itemName, quantity: 1 }];
      } else {
        return prevSelections.filter((item) => item.id !== itemId);
      }
    });
  };

  const handleQuantityChange = (itemId: number, quantity: number) => {
    setItemSelections((prevSelections) =>
      prevSelections.map((item) =>
        item.id === itemId ? { ...item, quantity: quantity > 0 ? quantity : 1 } : item
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!restaurantId) {
      setError('No restaurant ID found.');
      return;
    }

    if (itemSelections.length === 0) {
      setError('Please select at least one item and set its quantity.');
      return;
    }

    const newOrders = itemSelections.map((selection) => ({
      restaurant_id: parseInt(restaurantId as string, 10),
      item_id: selection.id,
      quantity: selection.quantity,
      unit: items.find((item) => item.id === selection.id)?.unit || '',
      timeline,
      notes,
      status: 'pending',
      flagged: false,
      pending_status: 'not_confirmed',
      cutoff_time: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    const { data, error } = await supabase
      .from('inventory_requests')
      .insert(newOrders)
      .select();

    if (error) {
      console.error('Supabase insert error:', error); 
      setError('Failed to submit the request. Please try again.');
    } else {
      setSuccess('Request submitted successfully!');
      setItemSelections([]); 
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
          <label htmlFor="items" className={styles.label}>
            Item Name <span className={styles.required}>*</span>
          </label>
          <div className={styles.checkboxList}>
            {items.map((item) => (
              <div key={item.id} className={styles.checkboxGroup}>
                <input
                  type="checkbox"
                  value={item.id}
                  onChange={(e) => handleItemChange(item.id, item.name, e.target.checked)}
                />
                <label>{item.name}</label>
                <input
                  type="number"
                  placeholder="Quantity"
                  min="1"
                  value={
                    itemSelections.find((selection) => selection.id === item.id)?.quantity || ''
                  }
                  onChange={(e) =>
                    handleQuantityChange(item.id, parseInt(e.target.value, 10) || 0)
                  }
                  disabled={!itemSelections.some((selection) => selection.id === item.id)}
                  className={styles.quantityInput}
                />
              </div>
            ))}
          </div>
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
    </Layout>
  );
};

export default RequestOrder;
