###### Understanding Grafana
-

- `apiVersion: 1`
    Grafana's provisioning system has versions. Version 1 is the current stable format. 

- `datasources:`
    A list of data source to create to startup. We can use multiple - Prometheus, Loki, Tempo all in the same file.

-  `name: Prometheus`
    What this data source is called in the Grafana UI. 

- `type: prometheus`
    What kind of data source. Grafana supports many types - `prometheus`, `loki`, `tempo`, `mysql`, `elasticsearch`. This tells grafana which plugin to use to communicate with it.

- `url: http://prometheus:9090`
    Where Grafana sends queries. prometheus is the Docker service name — Docker DNS resolves it. Port 9090 is where Prometheus listens.

- `isDefault: true`
   When you create a new dashboard panel, this data source is pre-selected. Only one can be default.

#### Query
```
rate(http_request_total[1m])

sum(rate(http_request_total[1m]))

histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
```

#### Percentiles - p50, p90, p95, p99
Imagine we have 100 requests and want to measure how long each took:
```
90 requests -> finished in under 200ms
5 requests  -> finished in under 500ms
4 requests  -> finished in under 2000ms 
1 request   -> finished in 8000ms
```

##### p50
50% of requests finished faster than this value 
In above example -> 200ms (means Half users got response in under 200ms)

##### p90
90% of requests finished faster than this value
In above example -> 200ms (90% of your users got a response in under 200ms)

##### p95
95% of requests finished faster than this value
In above example → 500ms (95% of your users got a response in under 500ms)

##### p99
99% of requests finished faster than this value
In above example → 2000ms (99% of your users got a response in under 2 seconds)

### Understanding SLI, SLO, SLA

1. SLI — Service Level Indicator
The actual measurement — a number you track

Examples:
- Request latency = 240ms
- Error rate = 0.5%
- Availability = 99.95%

This is the raw data. Our Prometheus metrics ARE your SLIs.


2. SLO — Service Level Objective
The target you set for your SLI — your internal goal
Examples:
- p99 latency must be under 500ms
- Error rate must be below 1%
- Availability must be above 99.9%

This is what your engineering team commits to internally.

3. SLA — Service Level Agreement
The contract with your customers — usually with financial penalties if broken

Examples:
- "We guarantee 99.9% uptime — if we fall below, you get a refund"
- "API response time will be under 1 second — or we credit your account"

SLA is always looser than SLO — because if your SLO is 99.9%, your SLA might be 99.5% to give yourself a safety buffer.

```
SLI (measurement) → compared against → SLO (target) → legally becomes → SLA (contract)

Prometheus measures p99 latency = 240ms   ← SLI
Our team says p99 must be < 500ms        ← SLO
Our contract says p99 < 1000ms           ← SLA
```

**Connections**
```
Your Histogram (prom-client)
         ↓
Prometheus stores bucket data
         ↓
PromQL: histogram_quantile(0.99, rate(http_request_duration_seconds_bucket[5m]))
         ↓
Grafana shows p99 latency graph
         ↓
Alertmanager fires alert if p99 > 500ms   ← your SLO threshold
         ↓
On-call engineer gets paged
```

We use p99 instead of average because average masks outliers. If p99 latency is 2 seconds, 1% of users — potentially thousands per day — are having a bad experience. We set our SLO at p99 < 500ms and alert in Alertmanager when it's breached. Average would never catch this.


```
sum by(route) (rate(http_request_total[1m]))

rate(http_request_total{route="/error"}[1m])

histogram_quantile(0.99, sum by(le,route)(rate(http_request_duration_seconds_bucket[5m])))

active_connections
```

p95 = 95% of requests finished faster than this value (5% were slower)
p99 = 99% of requests finished faster than this value (1% were slower)
high cardinality means too many unique label values. Example:`requestCounter.inc({ user_id: "12345" })  // millions of unique user_ids`

This creates millions of metric series in Prometheus memory → crashes it.
Rule: Never use unbounded values (user_id, request_id) as labels.



Provisioning specifically means: defining Grafana config as code files instead of clicking through the UI — so it's repeatable, version controlled, and survives container restart
