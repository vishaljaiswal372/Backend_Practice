import express from 'express';
import cors from 'cors';
import {userRouter} from './routes/user.route.js';
import cookieParser from 'cookie-parser';


const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use('/api/v1/user',userRouter);















export default app;
