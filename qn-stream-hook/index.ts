// qn-stream-hook/index.ts

import express from 'express';
import { ethers } from 'ethers';

// Define the expected structure of the request body
interface EventRequestBody {
    data: any[]; // Adjust the type according to your actual data structure
}

const app = express();
const PORT = 3000;

// Middleware to parse JSON bodies
app.use(express.json({limit: '50mb'}));

// Kuru Trade event ABI
const kuruTradeEventABI = [
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "uint40",
                "name": "orderId",
                "type": "uint40"
            },
            {
                "indexed": false,
                "internalType": "address",
                "name": "makerAddress",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "bool",
                "name": "isBuy",
                "type": "bool"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "price",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint96",
                "name": "updatedSize",
                "type": "uint96"
            },
            {
                "indexed": false,
                "internalType": "address",
                "name": "takerAddress",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "address",
                "name": "txOrigin",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint96",
                "name": "filledSize",
                "type": "uint96"
            }
        ],
        "name": "Trade",
        "type": "event"
    }
];

// Create a contract instance (replace with your contract address)
const contractAddress = '0x0000000000000000000000000000000000000000';
const contract = new ethers.Contract(contractAddress, kuruTradeEventABI);

// Endpoint to receive messages
app.post('/', async (req, res) => {
    var ip = req.ip
        || req.connection.remoteAddress
        || req.socket.remoteAddress;

    console.log(ip);
    const { data } = req.body as EventRequestBody;
    for (const blockLogs of data) {
        for (const txLogs of blockLogs) {
            for (const log of txLogs) {
                const eventSignature = log.topics[0]; // Get the event signature from the topics
                const isKuruTradeEvent = eventSignature === contract.interface.getEvent('Trade')?.topicHash; // Check if it matches KuruTrade

                if (isKuruTradeEvent) {
                    const decodedData = contract.interface.decodeEventLog('Trade', log.data, log.topics);
                    console.log(decodedData);
                } else {
                    console.log('Not a Kuru Trade event:', log);
                }
            }
        }
    }

    res.status(200).send('Events processed');
});

// Start the server
app.listen(PORT, '0.0.0.0', async () => {
    console.log(`Server is running on port ${PORT} and bound to all interfaces (0.0.0.0)`);
});