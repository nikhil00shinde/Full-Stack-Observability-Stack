import express, {Application, Request, Response} from "express";
const app: Application = express();

const port = 3000; 

//we want to enable URL-encoded form data parsing
app.use(express.urlencoded({ extended: true }));

app.use(express.json());

const delay = (ms : number) => new Promise(res => setTimeout(res,ms));
app.get('/', (req : Request, res: Response) => {
  const status = {
    status: "OK"
  }
  res.send(status);
});

app.get('/checkout', async (req: Request, res: Response) => {
  const ms = Math.random()*4000 + 1000;
  await delay(ms)
  res.send({order: "placed"});
});

app.get('/error', (req: Request, res: Response) => {
  res.status(500).send({error: "something went wrong"});
});

app.listen(port, () => {
  console.log(`Server is running on localhost:${port}`);
});

