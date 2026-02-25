import express from 'express';
import { generateResponse } from './chat_bot.js';
import cors from 'cors';
const app = express();
const port = 4000;

app.use(express.json());
app.use(cors())

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.post('/chat', async (req, res) => {
    const { message } = req.body
    const msg = await generateResponse(message)
    res.status(200).json({ reply: msg })
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});