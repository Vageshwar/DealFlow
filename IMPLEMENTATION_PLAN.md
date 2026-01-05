# DealFlow Implementation Plan: Phase 2 & Beyond

This document outlines the technical roadmap to transition DealFlow from a Hackathon MVP to an Enterprise-Grade Beta.

## 1. Core Infrastructure: Persistence Layer
**Goal:** Replace in-memory storage with a relational database to persist data across server restarts.

- [ ] **Database Setup**
  - Choose **SQLite** (for easy local deployment) or **PostgreSQL** (for production).
  - selection: **Prisma ORM** is recommended for type safety with TypeScript.
- [ ] **Schema Definition**
  - `User`: id, email, password_hash, role (Banker, Lawyer, Borrower), organization.
  - `Document`: id, content, current_hash, version.
  - `AuditLog`: id, document_id, user_id, action, diff_snapshot, previous_hash, timestamp.
- [ ] **API Migration**
  - Refactor `server/index.js` to read/write to the DB instead of global variables (`auditLog`, `documentState`).

## 2. User Architecture: Authentication & Management
**Goal:** Replace the simulation "User Switcher" with real secure identities.

- [ ] **Authentication System**
  - Implement **JWT (JSON Web Tokens)** for session management.
  - Create Login/Register screens in Electron.
  - Remove the "User Switcher" component from the header (except for Admins).
- [ ] **Role-Based Access Control (RBAC)**
  - Middleware to verify permissions:
    - `Banker`: Can create docs, edit all clauses, invite users.
    - `Lawyer`: Can edit clauses, suggest changes.
    - `Borrower`: Read-only or "Suggest Mode" only (cannot commit changes directly).

## 3. Blockchain Integration (Local Web3 / Hardhat)
**Goal:** Transition from a simulation to a **Real Ethereum-compatible Blockchain** running locally.

We will use **Hardhat Network**, which spins up a local instance of the Ethereum Virtual Machine (EVM). This allows us to use real Smart Contracts and Transactions without spending money or deploying to a public testnet.

### Stage 3.1: The Smart Contract
- [ ] **Setup Hardhat**:
  - `npm install --save-dev hardhat`
  - Initialize a basic project.
- [ ] **Develop Contract**:
  - Create `contracts/DealRegistry.sol`.
  - Function: `appendLog(bytes32 docHash, string memory userId, string memory action)`.
  - Store data in a Solidity `struct` array or `event` logs (cheaper).

### Stage 3.2: Server Integration
- [ ] **Connect Server to Local Blockchain**:
  - Install `ethers.js` in the server.
  - Connect to `http://127.0.0.1:8545` (Hardhat's default RPC).
  - Use one of the 20 test accounts provided by Hardhat as the "Admin" wallet.
- [ ] **Replace Simulation**:
  - In `server/index.js`, instead of pushing to `auditLog` array:
    - Call `await dealRegistry.appendLog(...)`.
    - Wait for block confirmation (instant on Hardhat).
    - Return the **Transaction Hash** (txHash) to the frontend.

### Stage 3.3: Verification
- [ ] **Frontend Update**:
  - Show the "Transaction Hash" in the UI.
  - (Optional) Build a simple "Block Explorer" view that reads directly from the Local EVM.

## 4. Enhanced Collaboration
**Goal:** Handle edit conflicts better than the current "last write wins" approach.

- [ ] **Conflict Resolution**
  - Implement **Yjs** or **Automerge** (CRDTs) to handle concurrent typing without overwriting.
  - Replace raw text broadcasting with delta updates.
- [ ] **Track Specific Changes**
  - Instead of hashing the whole doc, hash specific *operations* (e.g., "User A deleted line 40").

## 5. UI/UX Refinements
- [ ] **Dashboard**: A "My Deals" landing page to select which document to open.
- [ ] **Notifications**: Persistent notification center history (not just Toasts).
