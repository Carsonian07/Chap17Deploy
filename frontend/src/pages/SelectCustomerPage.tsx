import { FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Customer, shopApi } from "../api";

type Props = { onSelected: (customer: Customer) => void };

export default function SelectCustomerPage({ onSelected }: Props) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<number | "">("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    shopApi.getCustomers().then(setCustomers).catch((err) => setError(err.message));
  }, []);

  const filtered = useMemo(() => {
    const needle = search.toLowerCase();
    return customers.filter((c) =>
      `${c.firstName} ${c.lastName} ${c.email}`.toLowerCase().includes(needle)
    );
  }, [customers, search]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!selected) {
      setError("Select a customer first.");
      return;
    }

    try {
      const customer = await shopApi.selectCustomer(Number(selected));
      onSelected(customer);
      navigate("/place-order");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to select customer.");
    }
  }

  return (
    <section>
      <h2>Select Customer</h2>
      <form onSubmit={submit} className="panel">
        <label>Search</label>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="name or email" />

        <label>Customer</label>
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value === "" ? "" : Number(e.target.value))}
        >
          <option value="">Choose customer...</option>
          {filtered.map((c) => (
            <option key={c.customerId} value={c.customerId}>
              {c.firstName} {c.lastName} ({c.email})
            </option>
          ))}
        </select>

        <button type="submit">Use This Customer</button>
      </form>
      {error ? <p className="error">{error}</p> : null}
    </section>
  );
}
