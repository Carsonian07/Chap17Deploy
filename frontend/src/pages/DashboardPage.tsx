import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Customer, shopApi } from "../api";

type Props = { customer: Customer | null };

export default function DashboardPage({ customer }: Props) {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!customer) return;
    shopApi.getDashboard().then(setData).catch((err) => setError(err.message));
  }, [customer]);

  if (!customer) return <Navigate to="/select-customer" replace />;

  return (
    <section>
      <h2>Customer Dashboard</h2>
      {error ? <p className="error">{error}</p> : null}
      {data ? (
        <>
          <p>
            {data.customer.firstName} {data.customer.lastName} ({data.customer.email})
          </p>
          <p>Total orders: {data.orderCount}</p>
          <p>Total spend: ${Number(data.totalSpend).toFixed(2)}</p>
          <h3>Recent Orders</h3>
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Timestamp</th>
                <th>Fulfilled</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {data.recentOrders.map((o: any) => (
                <tr key={o.orderId}>
                  <td>{o.orderId}</td>
                  <td>{o.orderTimestamp}</td>
                  <td>{o.fulfilled ? "Yes" : "No"}</td>
                  <td>${Number(o.totalValue).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </section>
  );
}
