import { ethers } from "ethers";
import fs from "fs";

async function main() {
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
    // Wait for provider to be ready
    await provider.getNetwork();
    
    const signer = await provider.getSigner(0);

    const artifactPath = "./artifacts/contracts/DealRegistry.sol/DealRegistry.json";
    if (!fs.existsSync(artifactPath)) {
        throw new Error("Artifact not found. Run 'npx hardhat compile' first.");
    }

    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, signer);

    console.log("Deploying DealRegistry...");
    const contract = await factory.deploy();
    await contract.waitForDeployment();
    
    console.log("DealRegistry deployed to:", await contract.getAddress());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
