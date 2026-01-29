import express from 'express';
import cors from 'cors';
import {userRouter} from './routes/user.route.js';



const app = express();
app.use(cors());
app.use(express.json());


app.use('/api/v1/user',userRouter);















export default app;
