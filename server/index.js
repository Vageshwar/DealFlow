import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import crypto from 'crypto';
import pkg from '@prisma/client';

import fs from 'fs';
import { ethers } from 'ethers';

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

const app = express();
const httpServer = createServer(app);

// Allow CORS & JSON Body
app.use(cors());
app.use(express.json());

// API: Login
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    
    // Simple password check (MVP: no hashing yet, sorry security gods)
    const user = await prisma.user.findUnique({
        where: { name: username }
    });

    if (user && user.password === password) {
        // Return user info (strip password)
        const { password, ...safeUser } = user;
        res.json({ success: true, user: safeUser, token: "mock-jwt-token" });
    } else {
        res.status(401).json({ success: false, message: "Invalid credentials" });
    }
});

// API: Get Users (for dropdown if needed, though we might autofill)
app.get('/api/users', async (req, res) => {
    const users = await prisma.user.findMany({
        select: { name: true }
    });
    res.json(users);
});

// API: Get Documents (Dashboard)
app.get('/api/documents', async (req, res) => {
    const docs = await prisma.document.findMany({
        select: { id: true, title: true, updatedAt: true, version: true, hash: true }
    });
    res.json(docs);
});

const io = new Server(httpServer, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});

// Blockchain Setup
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
let dealRegistry;

async function initBlockchain() {
    try {
        const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
        // Wait for network to be ready (prevents startup race conditions)
        await provider.getNetwork();
        
        const signer = await provider.getSigner(0);
        
        const artifactPath = "./artifacts/contracts/DealRegistry.sol/DealRegistry.json";
        if (fs.existsSync(artifactPath)) {
             const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
             dealRegistry = new ethers.Contract(CONTRACT_ADDRESS, artifact.abi, signer);
             console.log("🔗 Connected to Local Blockchain at", CONTRACT_ADDRESS);
        } else {
             console.warn("⚠️  Blockchain artifact not found. Run 'npx hardhat compile'.");
        }
    } catch (e) {
        console.error("❌ Blockchain Connection Failed:", e.message);
        console.warn("   (Is 'npx hardhat node' running?)");
    }
}
initBlockchain();

// Helper to create hashes
const createHash = (prev, user, action, time) => {
    return crypto.createHash('sha256').update(user + time + action + prev).digest('hex');
}

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // 1. Join Document & Load Initial State
  socket.on('join-document', async (docId) => {
    socket.join(docId);
    console.log(`User ${socket.id} joined doc ${docId}`);
    
    // Fetch from DB
    const doc = await prisma.document.findUnique({
        where: { id: docId }
    });

    if (doc) {
        socket.emit('load-document', doc.content);
    } else {
        socket.emit('load-document', "");
    }
  });

  // 2. Load Audit Log
  const loadLogs = async () => {
       const logs = await prisma.auditLog.findMany({
           where: { docId: 'main-room' }, 
           orderBy: { id: 'asc' } 
       });
       socket.emit('load-audit', logs);
  };
  loadLogs();

  // 3. Real-Time Collaboration
  socket.on('text-change', async (data) => {
    await prisma.document.update({
        where: { id: data.docId },
        data: { content: data.content }
    });
    socket.to(data.docId).emit('text-change', data);
  });

  // 4. Commit Changes (The "Block")
  socket.on('commit-change', async (data) => {
     // Get last block hash (Tail)
     const lastLog = await prisma.auditLog.findFirst({
         where: { docId: data.docId },
         orderBy: { id: 'desc' }
     });

     const previousHash = lastLog ? lastLog.hash : '0';
     const timeNow = Date.now(); 
     
     const newHash = createHash(previousHash, data.user, data.action, timeNow.toString());

     // Write to Blockchain (if connected)
     let txHash = null;
     if (dealRegistry) {
        try {
            console.log(`⛏️  Mining block for ${data.user}...`);
            const tx = await dealRegistry.appendLog(
                data.docId, 
                data.user, 
                data.action, 
                newHash
            );
            console.log("   Sent TX:", tx.hash);
            // Wait for confirmation
            const receipt = await tx.wait(); // Confirm block mined
            txHash = receipt.hash; // Ethers v6: receipt.hash
            console.log("   ✅ Confirmed in Block:", receipt.blockNumber);
        } catch (e) {
            console.error("⚠️  Blockchain Write Failed:", e.message);
        }
     }

     // Create Block in DB
     const newBlock = await prisma.auditLog.create({
         data: {
             docId: data.docId,
             userName: data.user,
             action: data.action,
             hash: newHash,
             previousHash: previousHash,
             timestamp: new Date(timeNow),
             txHash: txHash
         }
     });

     console.log(`Audit Log Saved: ${newHash.substring(0,10)}... (TX: ${txHash ? txHash.substring(0,10) : 'None'})`);
     
     // Broadcast new block to everyone
     io.emit('new-audit-entry', newBlock);
  });

  // 5. Chat
  socket.on('chat-message', (msg) => {
    // msg: { user, text, time }
    // Broadcast to everyone
    io.emit('chat-message', msg);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`DealFlow Server running on http://localhost:${PORT}`);
});
