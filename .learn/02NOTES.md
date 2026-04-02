## Prometheus Metrics 
Prometheus is a **pull-based** metrics system. Our Node.js app exposes metrics on an endpoint, and Prometheus **scrapes** it on an interval.

#### The 4 Prometheus metric types:
1. **Counter:** - only goes up, never resets
    Example: total numbers of requests ever made to `/checkout`

2. **Gauge**: goes up AND down, snapshot of current value
    Example: how many requests are currently being processed rihgt now.

3. **Histogram:** - recors distribution, lets you calculate percentiles (p50, p95, p99)
    Example: how long did requests take - most were 100ms but some were 2000ms 

4. **Summary:** - similar to histogram but calculates percentiles client-side 
    Less commonly used - Histogram is preferred is most setups
