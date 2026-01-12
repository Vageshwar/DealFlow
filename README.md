# DealFlow (LMA EDGE Hackathon Submission)

**Real-Time Negotiation Platform for Syndicated Loans**

DealFlow is a desktop-native application designed to replace "email tag" in high-stakes legal negotiations. It brings the speed and density of a Bloomberg Terminal to the world of legal drafting, enabling bankers, lawyers, and borrowers to collaborate on loan documentation in real-time with an immutable audit trail secured by a local Ethereum blockchain.

---

## 🏆 Hackathon Context
This project was built for the **LMA EDGE Hackathon**. It addresses the challenge of modernizing the syndicated loan market by focusing on **efficiency, transparency, and data integrity**.

- **Submission Platform:** DevPost
- **Goal:** Transform static Word documents into live, data-rich living contracts.

---

## 🚀 Key Features

1.  **Real-Time Collaboration**: Multiple parties (Banker, Counsel, Borrower) can edit the Term Sheet simultaneously using WebSockets.
2.  **Immutable Audit Log**: Every "Commit" is cryptographically hashed (SHA-256) and legally secured by writing the hash to a local **Ethereum Smart Contract**.
3.  **LMA Clause Library**: One-click insertion of standard Loan Market Association (LMA) clauses (Negative Pledge, Events of Default, etc.).
4.  **Role-Based Identity**: Switch between user personas to simulate multi-party negotiation.
5.  **Encrypted Chat**: Context-aware communication channel alongside the document.
6.  **Diff View**: Visual comparison between the current draft and the last committed version.

---

## 🛠 Tech Stack

- **Runtime**: Electron (Desktop Native Experience)
- **Frontend**: React 18 + Vite + TailwindCSS
- **Editor**: Monaco Editor (VS Code core)
- **Backend**: Node.js + Express + Socket.io
- **Database**: Prisma ORM (SQLite for local dev)
- **Blockchain**: Hardhat (Local EVM), Ethers.js, Solidity
- **Security**: SHA-256 Hash Chains + Smart Contract Registry

---

## 🔮 Implementation Status

### Phase 1: Interactive MVP (✅ Completed)
- Real-time editing, role switching, and in-memory audit logs.

### Phase 2: Data Persistence (✅ Completed)
- Integrated **Prisma ORM** with **SQLite**.
- Documents, Chat History, and Audit Logs persist across server restarts.

### Phase 3: Real Local Blockchain (✅ Completed)
- Integrated **Hardhat Network** to run a local Ethereum node.
- Deployed `DealRegistry.sol` smart contract.
- The server now sends real transactions to the local chain to anchor every document commit.

### Phase 4: AI Assisted Drafting (🚧 Planned)
- Fine-tuned LLMs to suggest negotiation fallbacks based on market precedents.

---

## 📦 How to Run

### Prerequisite: Setup Environment
1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Setup Database (Prisma)**:
    Initialize the SQLite database.
    ```bash
    npx prisma generate
    npx prisma db push
    ```

### Step 1: Start Local Blockchain
Open a terminal and run the local Hardhat node. This simulates the Ethereum network.
```bash
npx hardhat node
```
*Keep this terminal running.*

### Step 2: Deploy Smart Contract
In a **new terminal**, deploy the `DealRegistry` contract to your local node.
```bash
npx hardhat run scripts/deploy.js --network localhost
```
*Note: This will likely deploy to `0x5FbDB2315678afecb367f032d93F642f64180aa3`, which is pre-configured in `server/index.js`.*

### Step 3: Start Application
In another **new terminal**, run the full development suite (Server + Client + Electron).
```bash
npm run dev
```

---

*Built with ❤️ by the Hikki_Blank*
