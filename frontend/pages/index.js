import { useEffect, useState } from "react";
import { ethers } from "ethers";
import "../styles/globals.css";

// Arc Testnet tokens
const USDC = "0x3600000000000000000000000000000000000000";
const EURC = "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a";

// ⬇️ ПОСЛЕ ДЕПЛОЯ заменишь эти адреса
const POOL_ADDRESS = "0xPOOL_ADDRESS";
const ROUTER_ADDRESS = "0xROUTER_ADDRESS";

export default function Home() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [amount, setAmount] = useState("1");
  const [direction, setDirection] = useState("AtoB");
  const [quote, setQuote] = useState(null);
  const [log, setLog] = useState([]);

  const logMsg = (m) => setLog((l) => [...l, m]);

  async function connectWallet() {
    if (!window.ethereum) {
      alert("Install MetaMask");
      return;
    }
    await window.ethereum.request({ method: "eth_requestAccounts" });
    const p = new ethers.BrowserProvider(window.ethereum);
    const s = await p.getSigner();
    setProvider(p);
    setSigner(s);
    const addr = await s.getAddress();
    setAccount(addr);
    logMsg("Connected: " + addr);
  }

  async function getQuote() {
    if (!provider) return alert("Connect wallet");
    if (ROUTER_ADDRESS.startsWith("0xPOOL"))
      return alert("Deploy contracts first");

    const abi = [
      "function getAmountOut(address,uint256) view returns (uint256)"
    ];
    const router = new ethers.Contract(ROUTER_ADDRESS, abi, provider);
    const decimals = 6;

    const amountIn = ethers.parseUnits(amount || "0", decimals);
    const tokenIn = direction === "AtoB" ? USDC : EURC;
    const out = await router.getAmountOut(tokenIn, amountIn);

    setQuote(ethers.formatUnits(out, decimals));
    logMsg("Quote received");
  }

  async function swap() {
    if (!signer) return alert("Connect wallet");
    if (POOL_ADDRESS.startsWith("0xPOOL"))
      return alert("Deploy contracts first");

    const decimals = 6;
    const amountIn = ethers.parseUnits(amount || "0", decimals);
    const tokenIn = direction === "AtoB" ? USDC : EURC;

    const erc20Abi = [
      "function approve(address,uint256) returns (bool)"
    ];
    const poolAbi = [
      "function swap(address,uint256,uint256)"
    ];

    const token = new ethers.Contract(tokenIn, erc20Abi, signer);
    logMsg("Approving token...");
    const tx1 = await token.approve(POOL_ADDRESS, amountIn);
    await tx1.wait();

    const pool = new ethers.Contract(POOL_ADDRESS, poolAbi, signer);
    logMsg("Sending swap...");
    const tx2 = await pool.swap(tokenIn, amountIn, 0);
    await tx2.wait();

    logMsg("Swap completed");
  }

  return (
    <div className="container">
      <div className="card">
        <h1>Arc Swap (Testnet)</h1>

        {!account ? (
          <button onClick={connectWallet}>Connect Wallet</button>
        ) : (
          <p>Connected: {account.slice(0, 6)}…{account.slice(-4)}</p>
        )}

        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount"
        />

        <select
          value={direction}
          onChange={(e) => setDirection(e.target.value)}
        >
          <option value="AtoB">USDC → EURC</option>
          <option value="BtoA">EURC → USDC</option>
        </select>

        <button className="secondary" onClick={getQuote}>
          Get quote
        </button>

        {quote && <p>≈ {quote}</p>}

        <button onClick={swap}>
          Swap (sign transaction)
        </button>

        <pre style={{ marginTop: 12 }}>
          {log.join("\n")}
        </pre>
      </div>
    </div>
  );
}
