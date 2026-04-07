## Full-Stack-Observability-Stack



#### Flow
```
Request → App (Node.js:3000)
               │
               ├── /metrics ──────────→ Prometheus:9090
               │                              │
               ├── logs ───────────→ Loki:3100          →Grafana:3000
               │                              │                  ↑
               └── traces ─────────→ Tempo:3200                  │
                                              │                  │
                                        Alertmanager:9093 ───────┘
                                              │
                                         Slack/PagerDuty
```

