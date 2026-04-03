import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { AdminOrderSummary, shopApi } from "../api";

export default function OrdersPage() {
  const [orders, setOrders] = useState<AdminOrderSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  const placed = new URLSearchParams(location.search).get("placed");

  useEffect(() => {
    shopApi.getAdminOrders().then(setOrders).catch((err) => setError(err.message));
  }, []);

  return (
    <section>
      <h2>Admin Order History</h2>
      {placed ? <p className="success">Order {placed} created successfully.</p> : null}
      {error ? <p className="error">{error}</p> : null}
      <table>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Timestamp</th>
            <th>Fulfilled</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.orderId}>
              <td>{o.orderId}</td>
              <td>{o.customerName} (#{o.customerId})</td>
              <td>{o.orderTimestamp}</td>
              <td>{o.fulfilled ? "Yes" : "No"}</td>
              <td>${Number(o.totalValue).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
