import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Create Default Users
  const users = [
    { name: 'J.P. Morgan (Agent)', role: 'Banker', color: 'bg-blue-600', password: 'password123' },
    { name: 'Acme Corp (Borrower)', role: 'Borrower', color: 'bg-emerald-600', password: 'password123' },
    { name: 'Linklaters (Counsel)', role: 'Lawyer', color: 'bg-purple-600', password: 'password123' },
    { name: 'Clifford Chance', role: 'Lawyer', color: 'bg-indigo-600', password: 'password123' },
    { name: 'Barclays (Lender)', role: 'Banker', color: 'bg-cyan-600', password: 'password123' }
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { name: u.name },
      update: {},
      create: u,
    });
  }

  // 2. Create Default Documents
  const docs = [
      {
          id: 'main-room',
          title: 'Syndicated Facility Agreement',
          content: `# SYNDICATED FACILITY AGREEMENT

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

---`,
          hash: 'genesis_hash'
      },
      {
          id: 'nda-draft',
          title: 'Non-Disclosure Agreement (Project Flight)',
          content: `# NON-DISCLOSURE AGREEMENT

**THIS AGREEMENT** is made on [Date] between:

1. **J.P. MORGAN** (Discloser); and
2. **ACME CORP** (Recipient).

## 1. Confidential Information
"Confidential Information" means all information disclosed by the Disclosing Party to the Receiving Party, whether orally or in writing, that is designated as confidential or that reasonably should be understood to be confidential given the nature of the information and the circumstances of disclosure.

## 2. Obligations
The Receiving Party shall hold the Confidential Information in strict confidence and shall not disclose such information to any third party without the prior written consent of the Disclosing Party.

## 3. Term
This Agreement shall remain in effect for a period of two (2) years from the date hereof.`,
          hash: 'nda_genesis'
      },
      {
          id: 'term-sheet',
          title: 'Term Sheet (Series B)',
          content: `# TERM SHEET - PROJECT FLIGHT

**Borrower**: Acme Corp
**Lenders**: J.P. Morgan, Barclays, Citi
**Total Facility Amount**: $500,000,000

## Key Terms

1. **Interest Rate**: SOFR + 3.50% p.a.
2. **Tenor**: 5 Years from Closing Date
3. **Upfront Fee**: 1.25% of Commitment
4. **Governing Law**: English Law

## Covenants (Summary)
- Net Leverage Ratio not to exceed 4.00:1.00
- Interest Coverage Ratio not less than 3.00:1.00
- Negative Pledge on all assets`,
          hash: 'ts_genesis'
      }
  ];

  for (const d of docs) {
      await prisma.document.upsert({
          where: { id: d.id },
          update: {},
          create: {
             id: d.id,
             title: d.title,
             content: d.content,
             version: 1,
             hash: d.hash
          }
      });
  }

  // 3. Create Genesis Block (if empty)
  const logCount = await prisma.auditLog.count();
  if (logCount === 0) {
    await prisma.auditLog.create({
      data: {
        hash: '0000000000000000000000000000000000000000000000000000000000000000',
        previousHash: '0',
        action: 'Genesis Block',
        userName: 'J.P. Morgan (Agent)', // Creating as system
        docId: 'main-room'
      }
    });
  }

  console.log('✅ Seeding complete.');
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  });
