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
    const { message, threadId } = req.body;
    // todo: validate above fields
    if (!message || !threadId) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const msg = await generateResponse(message, threadId)
    res.status(200).json({ reply: msg })
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});