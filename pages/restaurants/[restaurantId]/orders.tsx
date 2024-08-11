import React, { useState, useEffect } from 'react';
import Layout from '../../../components/Layout';
import styles from '../../../styles/Orders.module.css';
import { supabase } from '../../../utils/supabaseClient';
import { useRouter } from 'next/router';

const Orders: React.FC = () => {
  const [pendingOrders, setPendingOrders] = useState<any[]>([]);
  const [pastOrders, setPastOrders] = useState<any[]>([]);
  const [reportedOrders, setReportedOrders] = useState<any[]>([]);
  const [employeeId, setEmployeeId] = useState('');
  const [activeTab, setActiveTab] = useState('pending');

  const router = useRouter();
  const { restaurantId } = router.query;

  useEffect(() => {
    const fetchOrders = async () => {
      if (!restaurantId) return;

      // Fetch pending and accepted orders that are not yet confirmed for the specific restaurant
      const { data: pendingData, error: pendingError } = await supabase
        .from('inventory_requests')
        .select('*, items(name)')
        .or('status.eq.pending,status.eq.accepted')
        .eq('pending_status', 'not_confirmed')
        .eq('restaurant_id', restaurantId);

      // Fetch confirmed orders for past orders for the specific restaurant
      const { data: pastData, error: pastError } = await supabase
        .from('inventory_requests')
        .select('*, items(name)')
        .eq('pending_status', 'confirmed')
        .eq('restaurant_id', restaurantId);

      const { data: flaggedData, error: flaggedError } = await supabase
        .from('inventory_requests')
        .select('*, items(name)')
        .eq('flagged', true)
        .eq('restaurant_id', restaurantId);

      if (pendingError || pastError || flaggedError) {
        console.error('Error fetching orders:', pendingError || pastError || flaggedError);
      } else {
        setPendingOrders(pendingData || []);
        setPastOrders(pastData || []);
        setReportedOrders(flaggedData || []);
      }
    };

    fetchOrders();
  }, [restaurantId]);

  const handleConfirmOrder = async (orderId: string) => {
    const confirmedOrder = pendingOrders.find(order => order.id === orderId);
    if (confirmedOrder) {
      await supabase
        .from('inventory_requests')
        .update({ pending_status: 'confirmed' })
        .eq('id', orderId);

      setPastOrders([...pastOrders, { ...confirmedOrder, pending_status: 'confirmed' }]);
      setPendingOrders(pendingOrders.filter(order => order.id !== orderId));
      setEmployeeId('');
    }
  };

  const handleFlagOrder = async (orderId: string, isPastOrder = false) => {
    if (isPastOrder) {
      const updatedPastOrders = pastOrders.map(order =>
        order.id === orderId ? { ...order, flagged: !order.flagged } : order
      );
      setPastOrders(updatedPastOrders);

      const flaggedOrder = updatedPastOrders.find(order => order.id === orderId);
      await supabase
        .from('inventory_requests')
        .update({ flagged: flaggedOrder?.flagged })
        .eq('id', orderId);

      if (flaggedOrder?.flagged) {
        setReportedOrders([...reportedOrders, { ...flaggedOrder, status: 'Flagged' }]);
      } else {
        setReportedOrders(reportedOrders.filter(order => order.id !== orderId));
      }
    } else {
      const updatedPendingOrders = pendingOrders.map(order =>
        order.id === orderId ? { ...order, flagged: !order.flagged } : order
      );
      setPendingOrders(updatedPendingOrders);

      const flaggedOrder = updatedPendingOrders.find(order => order.id === orderId);
      await supabase
        .from('inventory_requests')
        .update({ flagged: flaggedOrder?.flagged })
        .eq('id', orderId);

      if (flaggedOrder?.flagged) {
        setReportedOrders([...reportedOrders, { ...flaggedOrder, status: 'Flagged' }]);
      } else {
        setReportedOrders(reportedOrders.filter(order => order.id !== orderId));
      }
    }
  };

  const handleNoteChange = (orderId: string, note: string) => {
    setPendingOrders(pendingOrders.map(order =>
      order.id === orderId ? { ...order, note } : order
    ));
    setPastOrders(pastOrders.map(order =>
      order.id === orderId ? { ...order, note } : order
    ));
  };

  const handleSendNote = async (orderId: string) => {
    const flaggedOrder = pendingOrders.find(order => order.id === orderId) || pastOrders.find(order => order.id === orderId);
    if (flaggedOrder && flaggedOrder.note) {
      await supabase
        .from('inventory_requests')
        .update({ note: flaggedOrder.note })
        .eq('id', orderId);

      setReportedOrders([...reportedOrders, { ...flaggedOrder, flagged: true, status: 'Flagged' }]);
      setPendingOrders(pendingOrders.map(order =>
        order.id === orderId ? { ...order, flagged: false, note: '' } : order
      ));
      setPastOrders(pastOrders.map(order =>
        order.id === orderId ? { ...order, flagged: false, note: '' } : order
      ));
    }
  };

  return (
    <Layout>
      <h1 className={styles.header}>Your Orders</h1>

      <div className={styles.mainContainer}>
        <div className={styles.tabContainer}>
          <button
            className={`${styles.tabButton} ${activeTab === 'pending' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            Pending Orders
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === 'past' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('past')}
          >
            Past Orders
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === 'reported' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('reported')}
          >
            Flagged Orders
          </button>
        </div>

        <div className={styles.ordersContainer}>
          {activeTab === 'pending' && (
            <div>
              {pendingOrders.length > 0 ? (
                pendingOrders.map(order => (
                  <div key={order.id} className={styles.orderCard}>
                    <div className={styles.orderHeader}>
                      <span>{order.items?.name || 'Unknown Item'} Order</span>
                      <span>Status: {order.status === 'accepted' ? 'Accepted' : 'Pending'}</span>
                      <i
                        className={`fas fa-flag ${styles.flagIcon}`}
                        onClick={() => handleFlagOrder(order.id)}
                        title="Flag this order"
                      ></i>
                    </div>
                    <div className={styles.orderDetails}>
                      <p>Item: {order.items?.name || 'Unknown Item'}</p>
                      <p>Quantity: {order.quantity} {order.unit}</p>

                      <label htmlFor={`employeeId-${order.id}`} className={styles.label}>
                        Enter Employee ID to Confirm:
                      </label>
                      <input
                        type="text"
                        id={`employeeId-${order.id}`}
                        className={styles.input}
                        value={employeeId}
                        onChange={(e) => setEmployeeId(e.target.value)}
                      />
                      <button
                        className={styles.confirmButton}
                        onClick={() => handleConfirmOrder(order.id)}
                        disabled={!employeeId}
                      >
                        Confirm Order
                      </button>

                      {order.flagged && (
                        <div className={styles.flagNoteContainer}>
                          <label htmlFor={`note-${order.id}`} className={styles.label}>
                            Describe the issue:
                          </label>
                          <textarea
                            id={`note-${order.id}`}
                            className={styles.textarea}
                            value={order.note}
                            onChange={(e) => handleNoteChange(order.id, e.target.value)}
                            placeholder="Type your note here..."
                          ></textarea>
                          <button
                            className={styles.sendNoteButton}
                            onClick={() => handleSendNote(order.id)}
                            disabled={!order.note}
                          >
                            Send to Admin
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className={styles.noOrdersMessage}>No pending orders.</p>
              )}
            </div>
          )}

          {activeTab === 'past' && (
            <div>
              {pastOrders.length > 0 ? (
                pastOrders.map(order => (
                  <div key={order.id} className={styles.orderCard}>
                    <div className={styles.orderHeader}>
                      <span>{order.items?.name || 'Unknown Item'} Order</span>
                      <span>Status: {order.status}</span>
                      <i
                        className={`fas fa-flag ${styles.flagIcon}`}
                        onClick={() => handleFlagOrder(order.id, true)}
                        title="Flag this order"
                      ></i>
                    </div>
                    <div className={styles.orderDetails}>
                      <p>Item: {order.items?.name || 'Unknown Item'}</p>
                      <p>Quantity: {order.quantity} {order.unit}</p>

                      {order.flagged && (
                        <div className={styles.flagNoteContainer}>
                          <label htmlFor={`note-${order.id}`} className={styles.label}>
                            Describe the issue:
                          </label>
                          <textarea
                            id={`note-${order.id}`}
                            className={styles.textarea}
                            value={order.note}
                            onChange={(e) => handleNoteChange(order.id, e.target.value)}
                            placeholder="Type your note here..."
                          ></textarea>
                          <button
                            className={styles.sendNoteButton}
                            onClick={() => handleSendNote(order.id)}
                            disabled={!order.note}
                          >
                            Send to Admin
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className={styles.noOrdersMessage}>No past orders.</p>
              )}
            </div>
          )}

          {activeTab === 'reported' && (
            <div>
              {reportedOrders.length > 0 ? (
                reportedOrders.map(order => (
                  <div key={order.id} className={styles.orderCard}>
                    <div className={styles.orderHeader}>
                      <span>{order.items?.name || 'Unknown Item'} Order</span>
                      <span>Status: {order.status}</span>
                    </div>
                    <div className={styles.orderDetails}>
                      <p>Item: {order.items?.name || 'Unknown Item'}</p>
                      <p>Quantity: {order.quantity} {order.unit}</p>
                      <p>Description: {order.note}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className={styles.noOrdersMessage}>No flagged orders.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Orders;
