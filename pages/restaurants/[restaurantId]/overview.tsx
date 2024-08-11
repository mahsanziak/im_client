import React, { useState, useEffect } from 'react';
import Layout from '../../../components/Layout';
import styles from '../../../styles/Overview.module.css';
import { supabase } from '../../../utils/supabaseClient';
import { useRouter } from 'next/router';

const Overview: React.FC = () => {
  const [pendingOrders, setPendingOrders] = useState(0);
  const [recentBilling, setRecentBilling] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<string[]>([]);

  const router = useRouter();
  const { restaurantId } = router.query; // Get restaurantId from the URL

  useEffect(() => {
    const fetchPendingOrders = async () => {
      if (!restaurantId) return;

      const { data, error } = await supabase
        .from('inventory_requests')
        .select('*')
        .eq('status', 'pending')
        .eq('restaurant_id', restaurantId); // Filter by restaurant_id
        
      if (error) {
        console.error('Error fetching pending orders:', error.message);
      } else {
        setPendingOrders(data.length);
      }
    };

    const fetchRecentBilling = async () => {
      if (!restaurantId) return;

      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('restaurant_id', restaurantId) // Filter by restaurant_id
        .order('date_time', { ascending: false })
        .limit(1)
        .single();  // Fetch the most recent invoice

      if (error) {
        console.error('Error fetching recent billing:', error.message);
      } else if (data) {
        setRecentBilling(`$${data.total}`);
      }
    };

    const fetchNotifications = async () => {
      const newNotifications: string[] = [];

      // Fetch pending order notifications
      if (pendingOrders > 0) {
        newNotifications.push(`You have ${pendingOrders} pending order(s).`);
      }

      // Fetch recent billing notifications
      if (recentBilling) {
        newNotifications.push(`Your most recent billing amount is ${recentBilling}.`);
      }

      // Other notifications can be added here
      newNotifications.push('New feature: Dark mode is now available!');

      setNotifications(newNotifications);
    };

    fetchPendingOrders();
    fetchRecentBilling();
    fetchNotifications(); // Call notifications after fetching orders and billing
  }, [restaurantId, pendingOrders, recentBilling]); // Dependencies to refetch notifications

  return (
    <Layout>
      <h1 className={styles.header}>Dashboard Overview</h1>

      <div className={styles.grid}>
        {/* Pending Orders Summary */}
        <div className={styles.card}>
          <h2 className={styles.cardHeader}>Pending Orders</h2>
          <p className={styles.cardContent}>
            You have <span className={styles.highlight}>{pendingOrders}</span> pending orders.
          </p>
          <a href={`/restaurants/${restaurantId}/orders`} className={styles.link}>View Orders</a>
        </div>

        {/* Recent Billing Summary */}
        <div className={styles.card}>
          <h2 className={styles.cardHeader}>Recent Billing</h2>
          <p className={styles.cardContent}>
            {recentBilling 
              ? <>Your most recent billing amount is <span className={styles.highlight}>{recentBilling}</span>.</> 
              : "No recent billing available."}
          </p>
          <a href={`/restaurants/${restaurantId}/billing`} className={styles.link}>View Billing</a>
        </div>

        {/* Notifications Summary */}
        <div className={styles.card}>
          <h2 className={styles.cardHeader}>Notifications</h2>
          <ul className={styles.notificationList}>
            {notifications.map((note, index) => (
              <li key={index} className={styles.notificationItem}>
                {note}
              </li>
            ))}
          </ul>
          <a href={`/restaurants/${restaurantId}/settings`} className={styles.link}>Manage Notifications</a>
        </div>

        {/* Account Settings Summary */}
        <div className={styles.card}>
          <h2 className={styles.cardHeader}>Account Settings</h2>
          <p className={styles.cardContent}>
            Customize your account settings and preferences.
          </p>
          <a href={`/restaurants/${restaurantId}/settings`} className={styles.link}>Go to Settings</a>
        </div>
      </div>
    </Layout>
  );
};

export default Overview;
