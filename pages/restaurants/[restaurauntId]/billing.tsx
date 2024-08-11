// pages/billing.tsx
import React, { useState } from 'react';
import Layout from '../../../components/Layout';
import styles from '../../../styles/styles/Billing.module.css';

const Billing: React.FC = () => {
  // Hardcoded data for orders
  const [orders] = useState([
    {
      id: 1,
      date: '2024-08-01',
      totalAmount: '$150.00',
      items: [
        { name: 'Item 1', quantity: 5, price: '$50.00' },
        { name: 'Item 2', quantity: 10, price: '$100.00' },
      ],
      status: 'Paid',
    },
    {
      id: 2,
      date: '2024-08-05',
      totalAmount: '$200.00',
      items: [
        { name: 'Item 3', quantity: 4, price: '$80.00' },
        { name: 'Item 4', quantity: 8, price: '$120.00' },
      ],
      status: 'Pending',
    },
    {
      id: 3,
      date: '2024-08-10',
      totalAmount: '$300.00',
      items: [
        { name: 'Item 5', quantity: 2, price: '$60.00' },
        { name: 'Item 6', quantity: 12, price: '$240.00' },
      ],
      status: 'Paid',
    },
  ]);

  const [activeOrder, setActiveOrder] = useState<number | null>(null);

  const toggleOrderDetails = (id: number) => {
    setActiveOrder(activeOrder === id ? null : id);
  };

  const printReceipt = (order: any) => {
    // Logic to handle printing receipt
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
                <span className={styles.orderTotal}>Total: {order.totalAmount}</span>
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
