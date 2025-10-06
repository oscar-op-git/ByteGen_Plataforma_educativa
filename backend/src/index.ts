import express from 'express';
const app = express();

import indexRoutes from './routes/index.js';

app.use(express.json());
app.use(express.urlencoded({extended:false}))

app.use(indexRoutes);

app.listen(4000);
console.log('server on port',4000)
