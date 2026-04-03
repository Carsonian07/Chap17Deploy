import { FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Customer, Product, shopApi } from "../api";

type Props = {
  customer: Customer | null;
  customerResolved: boolean;
  onCustomerSelected: (customer: Customer) => void;
  onCustomerCleared: () => void;
};

type LineItem = { productId: number | ""; quantity: number };

export default function PlaceOrderPage({ customer, customerResolved, onCustomerSelected, onCustomerCleared }: Props) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | "">(customer?.customerId ?? "");
  const [products, setProducts] = useState<Product[]>([]);
  const [items, setItems] = useState<LineItem[]>([{ productId: "", quantity: 1 }]);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [deviceType, setDeviceType] = useState("web");
  const [ipCountry, setIpCountry] = useState("US");
  const [promoUsed, setPromoUsed] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [customerError, setCustomerError] = useState<string | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    shopApi.getCustomers().then(setCustomers).catch((err) => setCustomerError(err.message));
  }, []);

  useEffect(() => {
    setSelectedCustomerId(customer?.customerId ?? "");
  }, [customer]);

  useEffect(() => {
    if (!customer) {
      setProducts([]);
      return;
    }
    shopApi.getProducts().then(setProducts).catch((err) => setOrderError(err.message));
  }, [customer]);

  const filteredCustomers = useMemo(() => {
    const needle = search.toLowerCase().trim();
    if (!needle) return customers;
    return customers.filter((c) =>
      `${c.firstName} ${c.lastName} ${c.email}`.toLowerCase().includes(needle)
    );
  }, [customers, search]);

  if (!customerResolved) return <p>Loading customer session...</p>;

  async function chooseCustomer(value: number | "") {
    setSelectedCustomerId(value);
    setCustomerError(null);

    if (!value) {
      return;
    }
    try {
      const selected = await shopApi.selectCustomer(Number(value));
      onCustomerSelected(selected);
    } catch (err) {
      setCustomerError(err instanceof Error ? err.message : "Failed to select customer.");
    }
  }

  async function cancelSelectedCustomer() {
    setCustomerError(null);
    try {
      await shopApi.clearCustomer();
      setSelectedCustomerId("");
      setSearch("");
      setItems([{ productId: "", quantity: 1 }]);
      setOrderError(null);
      onCustomerCleared();
    } catch (err) {
      setCustomerError(err instanceof Error ? err.message : "Failed to clear selected customer.");
    }
  }

  function addLine() {
    setItems((prev) => [...prev, { productId: "", quantity: 1 }]);
  }

  function updateLine(index: number, field: "productId" | "quantity", value: number | "") {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setOrderError(null);

    const payload = items
      .filter((x) => x.productId !== "")
      .map((x) => ({ productId: Number(x.productId), quantity: Number(x.quantity) }));

    if (payload.length === 0) {
      setOrderError("Add at least one valid line item.");
      return;
    }

    if (payload.some((x) => x.quantity <= 0)) {
      setOrderError("Quantity must be greater than 0.");
      return;
    }

    try {
      const result = await shopApi.placeOrderWithFeatures({
        items: payload,
        paymentMethod,
        deviceType,
        ipCountry,
        promoUsed,
        promoCode: promoUsed ? promoCode : undefined
      });
      navigate(`/admin/orders?placed=${result.orderId}`);
    } catch (err) {
      setOrderError(err instanceof Error ? err.message : "Failed to place order.");
    }
  }

  return (
    <section>
      <h2>Place Order</h2>
      <div className="panel">
        <h3>Select Customer</h3>
        <label>Search</label>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="name or email" />
        <label>Customer</label>
        <select
          value={selectedCustomerId}
          onChange={(e) => void chooseCustomer(e.target.value === "" ? "" : Number(e.target.value))}
        >
          <option value="">Choose customer...</option>
          {filteredCustomers.map((c) => (
            <option key={c.customerId} value={c.customerId}>
              {c.firstName} {c.lastName} ({c.email})
            </option>
          ))}
        </select>
        <div className="actions">
          <button type="button" onClick={cancelSelectedCustomer} disabled={!customer}>
            Cancel Selected Customer
          </button>
        </div>
        {customerError ? <p className="error">{customerError}</p> : null}
      </div>

      {customer ? (
        <form onSubmit={submit} className="panel">
          <h3>New Order for {customer.firstName} {customer.lastName}</h3>
          <label>Payment Method</label>
          <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
            <option value="card">Card</option>
            <option value="paypal">PayPal</option>
            <option value="apple_pay">Apple Pay</option>
            <option value="bank_transfer">Bank Transfer</option>
          </select>

          <label>Device Type</label>
          <select value={deviceType} onChange={(e) => setDeviceType(e.target.value)}>
            <option value="web">Web</option>
            <option value="mobile">Mobile</option>
            <option value="tablet">Tablet</option>
          </select>

          <label>IP Country</label>
          <select value={ipCountry} onChange={(e) => setIpCountry(e.target.value)}>
            <option value="US">US</option>
            <option value="CA">CA</option>
            <option value="MX">MX</option>
            <option value="GB">GB</option>
            <option value="DE">DE</option>
          </select>

          <label>Promo Used</label>
          <select value={promoUsed ? "yes" : "no"} onChange={(e) => setPromoUsed(e.target.value === "yes")}>
            <option value="no">No</option>
            <option value="yes">Yes</option>
          </select>

          {promoUsed ? (
            <>
              <label>Promo Code</label>
              <input value={promoCode} onChange={(e) => setPromoCode(e.target.value)} placeholder="e.g. SPRING10" />
            </>
          ) : null}

          {items.map((item, idx) => (
            <div key={idx} className="line-item">
              <select
                value={item.productId}
                onChange={(e) => updateLine(idx, "productId", Number(e.target.value))}
              >
                <option value="">Choose product...</option>
                {products.map((p) => (
                  <option key={p.productId} value={p.productId}>
                    {p.productName} (${p.price.toFixed(2)})
                  </option>
                ))}
              </select>
              <input
                type="number"
                min={1}
                value={item.quantity}
                onChange={(e) => updateLine(idx, "quantity", Number(e.target.value))}
              />
            </div>
          ))}

          <div className="actions">
            <button type="button" onClick={addLine}>
              Add Line Item
            </button>
            <button type="submit">Place Order</button>
          </div>
          {orderError ? <p className="error">{orderError}</p> : null}
        </form>
      ) : (
        <p className="panel">Select a customer above to place an order.</p>
      )}
    </section>
  );
}
