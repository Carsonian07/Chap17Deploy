# ── Build stage ──────────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY backend/ .
RUN dotnet publish ShopApi.csproj -c Release -o /app/backend

# ── Runtime stage ─────────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app

# Install Python 3 + ML dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
        python3 python3-pip python3-venv && \
    ln -s /usr/bin/python3 /usr/bin/python && \
    python3 -m venv /venv && \
    /venv/bin/pip install --no-cache-dir \
        scikit-learn pandas joblib numpy "psycopg[binary]" && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

ENV PATH="/venv/bin:$PATH"

# Copy published .NET app
COPY --from=build /app/backend ./backend

# Copy Python ML jobs and model — must sit at /app so ScoringService finds them
COPY jobs/ ./jobs
COPY fraud_model_v1.0.sav ./fraud_model_v1.0.sav

# Run from /app/backend so ContentRootPath = /app/backend
# and ScoringService resolves repoRoot = /app (one level up)
WORKDIR /app/backend

# PORT is injected by Railway at runtime
CMD ["sh", "-c", "ASPNETCORE_URLS=http://0.0.0.0:${PORT:-5000} dotnet ShopApi.dll"]
