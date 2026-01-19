async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying from:", deployer.address);

  // Arc Testnet tokens
  const USDC = "0x3600000000000000000000000000000000000000";
  const EURC = "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a";

  const Pool = await ethers.getContractFactory("AMMPool");
  const pool = await Pool.deploy(USDC, EURC);
  await pool.deployed();

  console.log("AMMPool deployed to:", pool.address);

  const Router = await ethers.getContractFactory("Router");
  const router = await Router.deploy(pool.address);
  await router.deployed();

  console.log("Router deployed to:", router.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
