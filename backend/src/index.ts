// backend/src/index.ts
import express from 'express';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 5000; // Backend will run on port 5000

app.use(cors());
app.use(express.json()); // For parsing JSON request bodies

app.get('/', (req, res) => {
  res.send('Hello from the backend!');
});

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});