import React, { useState, useEffect } from 'react';
import Layout from '../../../components/Layout';
import styles from '../../../styles/Billing.module.css';
import { supabase } from '../../../utils/supabaseClient';
import { useRouter } from 'next/router';

interface Item {
  name: string;
  quantity: number;
  price: string;
  orderDate: string;
}

interface Order {
  id: number;
  date: string;
  totalAmount: string;
  items: Item[];
  status: string;
}

interface Invoice {
  restaurantName: string;
  restaurantLocation: string;
  invoiceDate: string;
  dueDate: string;
  invoiceNumber: number;
  items: Item[];
  subtotal: string;
  taxPercentage: number;
  tax: string;
  total: string;
}

const Billing: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeOrder, setActiveOrder] = useState<number | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const router = useRouter();
  const { restaurantId } = router.query;

  useEffect(() => {
    const fetchOrders = async () => {
      if (!restaurantId) return;

      const { data, error } = await supabase
        .from('inventory_requests')
        .select(`
          id, 
          created_at, 
          quantity, 
          status, 
          pending_status,
          items!inner(name, cost_per_unit)
        `)
        .eq('status', 'accepted')
        .eq('pending_status', 'confirmed')
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error.message);
        return;
      }

      const groupedOrders: { [key: string]: Order } = {};

      data?.forEach((order) => {
        const orderDate = new Date(order.created_at);
        const month = orderDate.toLocaleString('default', { month: 'long', year: 'numeric' });

        const items = Array.isArray(order.items) ? order.items : [order.items]; // Ensure items is an array

        const totalItemCost = items.reduce((total: number, item: { cost_per_unit: string }) => {
          return total + parseFloat(item.cost_per_unit) * order.quantity;
        }, 0);

        if (!groupedOrders[month]) {
          groupedOrders[month] = {
            id: order.id,
            date: month,
            totalAmount: totalItemCost.toFixed(2),
            items: items.map((item) => ({
              name: item.name,
              quantity: order.quantity,
              price: parseFloat(item.cost_per_unit).toFixed(2),
              orderDate: orderDate.toLocaleString(), // Store order date and time
            })),
            status: order.status,
          };
        } else {
          groupedOrders[month].totalAmount = (
            parseFloat(groupedOrders[month].totalAmount) + totalItemCost
          ).toFixed(2);
          groupedOrders[month].items.push(
            ...items.map((item) => ({
              name: item.name,
              quantity: order.quantity,
              price: parseFloat(item.cost_per_unit).toFixed(2),
              orderDate: orderDate.toLocaleString(), // Store order date and time
            }))
          );
        }
      });

      setOrders(Object.values(groupedOrders));
    };

    fetchOrders();
  }, [restaurantId]);

  const toggleOrderDetails = (id: number) => {
    setActiveOrder(activeOrder === id ? null : id);
  };

  const printReceipt = async (order: Order) => {
    const { data: restaurantData } = await supabase
      .from('restaurants')
      .select('name, location')
      .eq('id', restaurantId)
      .single();

    const subtotal = parseFloat(order.totalAmount).toFixed(2);
    const taxPercentage = 5; // You can change this value or fetch it from the database if needed
    const tax = (parseFloat(subtotal) * taxPercentage / 100).toFixed(2);
    const total = (parseFloat(subtotal) + parseFloat(tax)).toFixed(2);

    const invoice: Invoice = {
      restaurantName: restaurantData?.name || 'Unknown Restaurant',
      restaurantLocation: restaurantData?.location || 'Unknown Location',
      invoiceDate: new Date().toLocaleDateString(),
      dueDate: new Date().toLocaleDateString(),
      invoiceNumber: order.id,
      items: order.items,
      subtotal,
      taxPercentage,
      tax,
      total,
    };

    setSelectedInvoice(invoice);

    setTimeout(() => {
      // Print the invoice (opens print dialog)
      window.print();
    }, 500);
  };

  return (
    <Layout>
      <div className={styles.nonPrintableContent}>
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
                        <span>Ordered At: {item.orderDate}</span> {/* Display order date and time */}
                      </li>
                    ))}
                  </ul>
                  <div className={styles.orderStatus}>Status: {order.status}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
  
      {selectedInvoice && (
        <div className={styles.printableInvoiceWrapper}>
          <div className={styles.printableInvoice}>
            <h1>INVOICE</h1>
            <div className={styles.invoiceDetails}>
              <p>Invoice Date: {selectedInvoice.invoiceDate}</p>
              <p>Due Date: {selectedInvoice.dueDate}</p>
              <p>Invoice Number: {selectedInvoice.invoiceNumber}</p>
            </div>
            <div className={styles.billTo}>
              <h3>Bill To:</h3>
              <p>{selectedInvoice.restaurantName}</p>
              <p>{selectedInvoice.restaurantLocation}</p>
            </div>
            <table className={styles.itemTable}>
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Rate</th>
                  <th>Quantity</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {selectedInvoice.items.map((item: Item, index: number) => (
                  <tr key={index}>
                    <td>{item.name}</td>
                    <td>${parseFloat(item.price).toFixed(2)}</td>
                    <td>{item.quantity}</td>
                    <td>${(item.quantity * parseFloat(item.price)).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className={styles.totals}>
              <div className={styles.subtotal}>
                <p>Subtotal:</p>
                <p>${selectedInvoice.subtotal}</p>
              </div>
              <div className={styles.tax}>
                <p>Tax ({selectedInvoice.taxPercentage}%):</p>
                <p>${selectedInvoice.tax}</p>
              </div>
              <div className={styles.total}>
                <p>Total Amount Due:</p>
                <p>${selectedInvoice.total}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Billing;
