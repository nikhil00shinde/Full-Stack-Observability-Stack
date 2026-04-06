import express, {Application, Request, Response} from "express";
import {Counter, Gauge, Histogram, register} from 'prom-client';

//Counter - only goes up
const requestCounter = new Counter({
  name: 'http_request_total',
  help: 'Total HTTP requests',
  labelNames: ['route','method']
});
//Gauge - goes up and down 
const activeConnections = new Gauge({
  name: 'active_connections',
  help: 'Currectly active requests'
});
//Histogram = measures distributions
const requestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Request duration in seconds',
  labelNames: ['route'],
  buckets: [0.1, 0.2, 0.3, 0.5, 1.0, 2.0, 3.0, 4.0, 5.0, 6.0 ,7.0] //seconds 
});


const app: Application = express();

const port = 3000; 


//we want to enable URL-encoded form data parsing
app.use(express.urlencoded({ extended: true }));

app.use(express.json());

const delay = (ms : number) => new Promise(res => setTimeout(res,ms));
app.get('/', (_req : Request, res: Response) => {
  activeConnections.inc();
  const end = requestDuration.startTimer({route: '/'});
  const status = {
    status: "OK"
  }
  end();
  requestCounter.inc({route: '/', method:'GET'});
  activeConnections.dec();
  res.send(status);
});

app.get('/checkout', async (req: Request, res: Response) => {
  activeConnections.inc();
  const end = requestDuration.startTimer({route: '/checkout'})
  const ms = Math.random()*4000 + 1000;
  await delay(ms)
  end();
  requestCounter.inc({route:'/checkout', method: 'GET'});
  activeConnections.dec();
  res.send({order: "placed"});
});

app.get('/error', (req: Request, res: Response) => {
  activeConnections.inc();
  const end = requestDuration.startTimer({route:'/error'});
  end();
  requestCounter.inc({route: '/error',method: 'GET'});
  activeConnections.dec();
  res.status(500).send({error: "something went wrong"});
});

app.get('/metrics', async (req: Request, res : Response) => {
  res.set('Content-Type', register.contentType);
  res.send(await register.metrics());
});

app.listen(port, () => {
  console.log(`Server is running on localhost:${port}`);
});

