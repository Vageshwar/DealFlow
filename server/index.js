import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import crypto from 'crypto';

const app = express();
const httpServer = createServer(app);

// Allow CORS for the frontend
app.use(cors());
app.use(express.json());

const io = new Server(httpServer, {
  cors: {
    origin: "*", // allow Electron connection
    methods: ["GET", "POST"]
  }
});

// --- DEALFLOW CORE LOGIC ---

// A. IN-MEMORY BLOCKCAHIN (HASH CHAIN)
// In a real app, this would be a Merkle Tree in a DB or a real ledger (Hyperledger/Ethereum)
const GENESIS_HASH = '0000000000000000000000000000000000000000000000000000000000000000';

// Helper to create hashes
const createHash = (prev, user, action, time) => {
    return crypto.createHash('sha256').update(user + time + action + prev).digest('hex');
}

// Pre-populate history
const timeNow = Date.now();
const genesisBlock = { 
    hash: GENESIS_HASH, 
    previousHash: '0', 
    user: 'System', 
    action: 'Genesis Block', 
    timestamp: timeNow - 10000000 
};

// Block 1: Deal Created
const block1Time = timeNow - 86400000; // 1 day ago
const block1Hash = createHash(GENESIS_HASH, 'System', 'Deal Room Created', block1Time);
const block1 = {
    hash: block1Hash,
    previousHash: GENESIS_HASH,
    user: 'Refinitiv System',
    action: 'Deal Room Created',
    timestamp: block1Time
};

// Block 2: Draft v1
const block2Time = timeNow - 43200000; // 12 hours ago
const block2Hash = createHash(block1Hash, 'Linklaters (Counsel)', 'Initial Draft Uploaded (v1)', block2Time);
const block2 = {
    hash: block2Hash,
    previousHash: block1Hash,
    user: 'Linklaters (Counsel)',
    action: 'Initial Draft Uploaded (v1)',
    timestamp: block2Time
};

let auditLog = [genesisBlock, block1, block2];

// Use Standard LMA Text
let documentState = `# SYNDICATED FACILITY AGREEMENT

DATED 3rd JANUARY 2026

BETWEEN:

1.  **ACME CORP GLOBAL PLC** (the "Company");
2.  **J.P. MORGAN SECURITIES PLC** (the "Arranger");
3.  **THE FINANCIAL INSTITUTIONS** listed in Schedule 1 (The Original Lenders); and
4.  **AgriBank PLC** as agent of the other Finance Parties (the "Agent").

---

## 1. DEFINITIONS AND INTERPRETATION

### 1.1 Definitions
In this Agreement:

**"Acceding Lender"** means any person who becomes a Party as a Lender in accordance with Clause 2.2 (Increase).

**"Affiliate"** means, in relation to any person, a Subsidiary of that person or a Holding Company of that person or any other Subsidiary of that Holding Company.

**"Authorization"** means an authorization, consent, approval, resolution, license, exemption, filing, notarization or registration.

**"Business Day"** means a day (other than a Saturday or Sunday) on which banks are open for general business in London.

**"Change of Control"** means any person or group of persons acting in concert gains control of the Company.

**"Default"** means an Event of Default or any event or circumstance specified in Clause 23 (Events of Default) which would (with the expiry of a grace period, the giving of notice, the making of any determination under the Finance Documents or any combination of any of the foregoing) be an Event of Default.

**(a) No Agent or Arranger shall be bound to enquire:**
(i) whether or not any Default has occurred;
(ii) as to the performance, default or any breach by any Party of its obligations under any Finance Document; or
(iii) whether any other event specified in any Finance Document has occurred.

---
`; 

// Helper: Calculate SHA-256 Hash
// Logic: SHA256(User + Timestamp + Action + PreviousHash)
function generateBlock(user, action, previousHash) {
  const timestamp = Date.now();
  const payload = `${user}${timestamp}${action}${previousHash}`;
  const hash = crypto.createHash('sha256').update(payload).digest('hex');

  return {
    hash,
    previousHash,
    user,
    action,
    timestamp
  };
}

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // 2. Initial Sync
  // Send the full chain to the new user so they can verify integrity
  socket.emit('load-audit', auditLog);

  // Join a specific document room (for MVP we might just use one global 'main' room)
  socket.on('join-document', (docId) => {
    socket.join(docId);
    console.log(`User ${socket.id} joined doc ${docId}`);
    // Send current document state
    socket.emit('load-document', documentState);
  });

  // 3. Real-Time Collaboration (Text Changes)
  // We broadcast this immediately for "Optimistic UI" feel.
  // We do NOT hash every keystroke, only specific 'commit' actions.
  socket.on('text-change', (data) => {
    // data: { docId, content, delta, cursor }
    // Update server state
    documentState = data.content;
    // Broadcast to everyone else in the room (don't echo back to sender)
    socket.to(data.docId).emit('text-change', data);
  });

  // 4. Secure Commit (The "Save" Action)
  // This triggers the blockchain write.
  socket.on('commit-change', (data) => {
    // data: { docId, user, action } 
    // Example Action: "Updated Negative Pledge Clause"
    
    // A. Get the tip of the chain
    const lastBlock = auditLog[auditLog.length - 1];
    
    // B. Generate new block linked to the previous one
    const newBlock = generateBlock(data.user, data.action, lastBlock.hash);
    
    // C. Append to store
    auditLog.push(newBlock);
    
    // D. Broadcast the new legitimate block to ALL clients (including sender)
    io.to(data.docId).emit('new-audit-entry', newBlock);
    
    console.log('New Block Mined:', newBlock.hash.substring(0, 10) + '...');
  });

  // 5. Chat System
  socket.on('chat-message', (msg) => {
    // msg: { user, text, time }
    // Broadcast to everyone including sender (simplify client logic)
    io.to('main-room').emit('chat-message', msg);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = 3001;
httpServer.listen(PORT, () => {
  console.log(`DealFlow Server running on http://localhost:${PORT}`);
});
