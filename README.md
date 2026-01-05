# DealFlow (LMA EDGE Hackathon Submission)

**Real-Time Negotiation Platform for Syndicated Loans**

DealFlow is a desktop-native application designed to replace "email tag" in high-stakes legal negotiations. It brings the speed and density of a Bloomberg Terminal to the world of legal drafting, enabling bankers, lawyers, and borrowers to collaborate on loan documentation in real-time with an immutable audit trail.

---

## 🏆 Hackathon Context
This project was built for the **LMA EDGE Hackathon**. It addresses the challenge of modernizing the syndicated loan market by focusing on **efficiency, transparency, and data integrity**.

- **Submission Platform:** DevPost
- **Goal:** Transform static Word documents into live, data-rich living contracts.

---

## 🚀 Key Features (MVP)

1.  **Real-Time Collaboration**: Multiple parties (Banker, Counsel, Borrower) can edit the Term Sheet simultaneously.
2.  **Immutable Audit Log**: Every "Commit" is cryptographically hashed (SHA-256) and linked to the previous entry, creating a tamper-evident "Lite-Blockchain" ledger.
3.  **LMA Clause Library**: One-click insertion of standard Loan Market Association (LMA) clauses (Negative Pledge, Events of Default, etc.).
4.  **Role-Based Identity**: Switch between user personas to simulate multi-party negotiation.
5.  **Encrypted Chat**: Context-aware communication channel alongside the document.
6.  **Diff View**: Visual comparison between the current draft and the last committed version.

---

## 🛠 Tech Stack

- **Runtime**: Electron (Desktop Native Experience)
- **Frontend**: React 18 + Vite + TailwindCSS
- **Editor**: Monaco Editor (VS Code core)
- **Backend**: Node.js + Express
- **Real-Time**: Socket.io (WebSockets)
- **Security**: SHA-256 Hash Chains for audit logging

---

## 🔮 Future Roadmap & Architecture

While the MVP simulates the core interaction, the production vision moves towards enterprise-grade infrastructure:

### Phase 2: Data Persistence (SQL)
- **Current**: In-memory storage for hackathon speed.
- **Future**: Migrate to **PostgreSQL** or **SQLite** (local-first) to store document states, user profiles, and chat history persistently.

### Phase 3: Real Local Blockchain (Hardhat)
- **Current**: A linear Hash Chain (SHA-256) maintained in memory.
- **Future**: 
    - **Hardhat Network**: Spin up a full, industry-standard Ethereum node locally (`npx hardhat node`).
    - **Smart Contract Registry**: A Solidity contract (`DealRegistry.sol`) that permanently records the hash of every document version.
    - **Real Web3 Transactions**: The application will sign and send actual transactions to this local network, generating real Transaction Hashes (0x...) without gas costs.

### Phase 4: AI Assisted Drafting
- **Plan**: Fine-tuned LLMs to suggest negotiation fallbacks based on market precedents.

---

## 📦 How to Run

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Start Development Suite**:
    (Runs Server, React Client, and Electron simultaneously)
    ```bash
    npm run dev
    ```

---

*Built with ❤️ by the Hikki_Blank*
