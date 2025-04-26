import express  from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import 'dotenv/config';

import connectDB from "./config/mongodb.js";
import authRouter from "./routes/authRoutes.js";

const app = express();
const port = process.env.port || 3030;
connectDB();


app.use(express.json());
app.use(cookieParser());
app.use(cors({credentials: true}));

//API endpoints
app.get('/',(req,res) => res.send('API working !!'));
app.use('/api/auth' ,authRouter)


app.listen(port, ()=> console.log(`server running on ${port}`));