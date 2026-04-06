## Understaning the mental model 

### The mental model 
- The three pillars of observability from the first principles:
    - **Metrics** : what happened (numbers) (Prometheus + grafana)
    - **Logs**    : why it happened (events) (Loki)
    - **Traces**  : where in the journey it broke (span across services) (Tempo)
Without a *Trace ID* can't correlate a single request across multiple services.

##### Why logs alone are not enough 
- In a distributed system, a single request touches multiple services. Each service logs independently with no shared context. Problems:
    - 1000 concurrent requests produces interleaved logs - impossible to group by request 
    - No way to know which log line from service A belongs to the same request as service B 
    - Cannot see the full journey or measure end-to-end latency.

##### Trace ID, Spans, and Hierarchy 
A Trace ID is a unique identifier generated once at the entry point of a request and passed to every service it touches.
- Passed to every downstream service the request touches.
- Allows you to reconstruct the full journey of a single request across service.


| Concept | What it is |
| --- | --- |
| Trace ID | Unique per request - not per user. Groups the entire journey. |
| Span | One single operation (e.g., auth-service.verify) |
| Parent Span | The caller span (e.g., /checkout) |
| Child Span | A downstream operation called by the parent |

Well, at first I thought why not user_id or session_id? One user can have many concurrent requests. We need something unique per request, not per person.

dependencies: Needed at runtime in the container
devDependencies: Only needed to build/develop - not in final image.

tsconfig.json - Typescript configuration, tells typescript what to do, how to do? 
    - build : tsc 
    - start: node dist/index.js

##### Two phases of Docker:
- **Phase 1 - Building the image**(`docker build`)
    - This is when Docker executes each instructions top to bottom and creates layers. 
    - Catches created here 

- **Phase 2 - Running the container**(`docker run`)
    - This is when the image is done and you actually start the container.

- `--omit=dev` -> skips devDependencies in stage 2, keeping the image small
- `COPY --from=builder` -> copies files from a previous stage
- `CMD vs RUN` -> RUN executes at build time, CMD executes at container startup


| Instruction | Phase | Purpose |
| --- | --- | --- |
| FROM | Build | Set the base image |
| WORKDIR | Build | Set working directory (always use absolute path /app) |
| COPY | Build | Copy files from host to image |
| RUN | Build | Execute a command, creates a layer (can have amny) |
| CMD | Runtime | Start the app when container runs (only one allowed) |

#### Why all three? 
- Metrics tell you: error rate on /checkout spiked to 80% at 3:42pm
- Logs tell you: payment-service threw TimeoutException at 3:42pm
- Traces tell you: the timeout happened inside db.query() called by payment-service, taking 7800ms
Together: you know WHAT broke, WHY it broke, and WHERE in the call chain it broke

## Trace ID, Spans & Distributed Tracing
The problem with Logs Alone
- In distributed system, a single request touches multiple services. Each logs independently. With 1000 concurrent requests, logs are completely interleaved - we connont tell which log file belongs to which request.


| Concept | What it is | Analogy |
| --- | --- | --- |
| TraceID | Unique ID per request, generated at entry point, passed to every service | FedEx Tracking number |
| Span | One single operation within the trace (e.g., auth-service.verify) | One warehouse stop |
| Parent Span | The caller operation (/checkout) | The origin warehouse |
| Child span | A downstream operation called by the parent | Easy delivery stop |


***Why not user_id or session_id?***
- user_id: one user can have many concurrent requests — cannot distinguish them
- session_id: one session spans many requests — too broad
- Trace ID: unique per single request lifecycle — born at entry, dies at response

Grafana separates visualization from storage so each component can be replaced, scaled, or upgraded independently. This follows the separation of concerns principle — Prometheus focuses on efficient time-series storage, Grafana focuses on rendering. You can swap either without affecting the other."
