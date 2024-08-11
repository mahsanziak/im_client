import React, { useState, useEffect } from 'react';
import Layout from '../../../components/Layout';
import styles from '../../../styles/Billing.module.css';
import { supabase } from '../../../utils/supabaseClient';

interface Order {
  id: number;
  date: string;
  totalAmount: string;
  items: {
    name: string;
    quantity: number;
    price: string;
  }[];
  status: string;
}

const Billing: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeOrder, setActiveOrder] = useState<number | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      const { data, error } = await supabase
        .from('inventory_requests')
        .select(`
          id, 
          created_at, 
          quantity, 
          status, 
          pending_status,
          items!inner(name, price)
        `)
        .eq('status', 'approved')
        .eq('pending_status', 'approved')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error.message);
        return;
      }

      const groupedOrders: { [key: string]: Order } = {};

      data?.forEach((order) => {
        const month = new Date(order.created_at).toLocaleString('default', { month: 'long', year: 'numeric' });

        const totalItemCost = order.items.reduce((acc: number, item: any) => {
          return acc + parseFloat(item.price) * order.quantity;
        }, 0);

        if (!groupedOrders[month]) {
          groupedOrders[month] = {
            id: order.id,
            date: month,
            totalAmount: totalItemCost.toFixed(2),
            items: order.items.map((item: any) => ({
              name: item.name,
              quantity: order.quantity,
              price: `$${(parseFloat(item.price) * order.quantity).toFixed(2)}`,
            })),
            status: order.status,
          };
        } else {
          groupedOrders[month].totalAmount = (
            parseFloat(groupedOrders[month].totalAmount) + totalItemCost
          ).toFixed(2);
          groupedOrders[month].items.push(
            ...order.items.map((item: any) => ({
              name: item.name,
              quantity: order.quantity,
              price: `$${(parseFloat(item.price) * order.quantity).toFixed(2)}`,
            }))
          );
        }
      });

      setOrders(Object.values(groupedOrders));
    };

    fetchOrders();
  }, []);

  const toggleOrderDetails = (id: number) => {
    setActiveOrder(activeOrder === id ? null : id);
  };

  const printReceipt = (order: Order) => {
    console.log('Printing receipt for:', order);
    window.print();
  };

  return (
    <Layout>
      <h1 className={styles.header}>Billing</h1>
      <p className={styles.description}>View your requested orders and print receipts below.</p>

      <div className={styles.ordersContainer}>
        {orders.map((order) => (
          <div key={order.id} className={styles.orderCard}>
            <div className={styles.orderHeader} onClick={() => toggleOrderDetails(order.id)}>
              <div>
                <span className={styles.orderDate}>{order.date}</span>
                <span className={styles.orderTotal}>Total: ${order.totalAmount}</span>
              </div>
              <button className={styles.printButton} onClick={() => printReceipt(order)}>
                Print Receipt
              </button>
            </div>

            {activeOrder === order.id && (
              <div className={styles.orderDetails}>
                <h4>Order Details</h4>
                <ul className={styles.itemList}>
                  {order.items.map((item, index) => (
                    <li key={index} className={styles.item}>
                      <span>{item.name}</span>
                      <span>Quantity: {item.quantity}</span>
                      <span>Price: {item.price}</span>
                    </li>
                  ))}
                </ul>
                <div className={styles.orderStatus}>Status: {order.status}</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </Layout>
  );
};

export default Billing;
