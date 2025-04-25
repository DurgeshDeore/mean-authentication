import express  from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import 'dotenv/config';

const app = express();
const port = process.env.port || 3030;

app.use(express.json());
app.use(cookieParser());
app.use(cors({credentials: true}));

app.get('/',(req,res) => res.send('API working !!'));

app.listen(port, ()=> console.log(`server running on ${port}`));