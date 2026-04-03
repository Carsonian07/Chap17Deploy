import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { Customer, shopApi } from "../api";

type Props = { customer: Customer | null };

export default function OrderDetailPage({ customer }: Props) {
  const { orderId } = useParams();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!customer || !orderId) return;
    shopApi.getOrderDetails(Number(orderId)).then(setData).catch((err) => setError(err.message));
  }, [customer, orderId]);

  if (!customer) return <Navigate to="/select-customer" replace />;

  return (
    <section>
      <h2>Order Detail</h2>
      {error ? <p className="error">{error}</p> : null}
      {data ? (
        <>
          <p>
            Order #{data.order.orderId} | {data.order.orderTimestamp} | Total ${Number(data.order.totalValue).toFixed(2)}
          </p>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Line Total</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item: any, idx: number) => (
                <tr key={idx}>
                  <td>{item.productName}</td>
                  <td>{item.quantity}</td>
                  <td>${Number(item.unitPrice).toFixed(2)}</td>
                  <td>${Number(item.lineTotal).toFixed(2)}</td>
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
