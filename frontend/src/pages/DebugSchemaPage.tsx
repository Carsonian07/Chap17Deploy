import { useEffect, useState } from "react";
import { shopApi } from "../api";

export default function DebugSchemaPage() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    shopApi.getSchema().then(setData).catch((err) => setError(err.message));
  }, []);

  return (
    <section>
      <h2>Schema Debug</h2>
      {error ? <p className="error">{error}</p> : null}
      {data?.tables?.map((t: any) => (
        <div key={t.table} className="panel">
          <h3>{t.table}</h3>
          <ul>
            {t.columns.map((c: any) => (
              <li key={c.name}>
                {c.name} ({c.type})
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}
