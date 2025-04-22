"use client";

/**
 * Particle Network Tutorial App
 * Demonstrates the usage of Particle's Account Abstraction and Smart Accounts
 * Features: Wallet connection, balance checking, gasless transactions, and message signing
 */

// React and UI Components
import React, { useEffect, useState, useCallback } from "react";
import LinksGrid from "@/components/Links";
import Header from "@/components/Header";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import TxNotification from "@/components/TxNotification";

// Particle Network SDK
import {
  ConnectButton,
  useAccount,
  usePublicClient,
  useParticleAuth,
  useSmartAccount,
  useWallets,
} from "@particle-network/connectkit";
import { AAWrapProvider, SendTransactionMode } from "@particle-network/aa"; // Only when using EIP1193Provider

// Blockchain Utilities
import { ethers, type Eip1193Provider } from "ethers";
import { formatEther, parseEther, verifyMessage } from "viem";
import { formatBalance, truncateAddress, copyToClipboard } from "@/utils/utils";

export default function Home() {
  // Particle Network Hooks
  const { isConnected, chainId, chain, address } = useAccount(); // address here is from the EOA (to sign messages in this case)
  const { getUserInfo } = useParticleAuth();
  const publicClient = usePublicClient();
  const smartAccount = useSmartAccount();
  const [primaryWallet] = useWallets();

  // Wallet State
  const [userAddress, setUserAddress] = useState<string>("");
  const [userInfo, setUserInfo] = useState<Record<string, any> | null>(null);
  const [balance, setBalance] = useState<string | null>(null);

  // Transaction State
  const [recipientAddress, setRecipientAddress] = useState<string>("");
  const [isSending, setIsSending] = useState<boolean>(false);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);

  // Initialize ethers provider with gasless transaction mode
  const customProvider = smartAccount
    ? new ethers.BrowserProvider(
        new AAWrapProvider(
          smartAccount,
          SendTransactionMode.Gasless
        ) as Eip1193Provider,
        "any"
      )
    : null;

  // Get wallet client for signing messages
  // This is basically the EOA associated with the smart account
  const walletClient = primaryWallet?.getWalletClient();

  /**
   * Fetches the native token balance for a given address
   * @param {string} targetAddress - The address to fetch the balance for
   */
  const fetchBalance = useCallback(
    async (targetAddress: string) => {
      try {
        const balanceResponse = await publicClient?.getBalance({
          address: targetAddress as `0x${string}`,
        });

        if (balanceResponse) {
          const balanceInEther = formatEther(balanceResponse);
          setBalance(formatBalance(balanceInEther));
        } else {
          console.error("Could not fetch balance");
          setBalance("0.0");
        }
      } catch (error) {
        console.error("Error fetching balance:", error);
        setBalance("Error");
      }
    },
    [publicClient]
  );

  /**
   * Load user's account data including address, balance, and profile info
   */
  useEffect(() => {
    const loadAccountData = async () => {
      if (!isConnected || !smartAccount) {
        setUserAddress("");
        setBalance(null);
        setUserInfo(null);
        return;
      }

      try {
        // Get smart account address
        const accountAddress = await smartAccount.getAddress();
        setUserAddress(accountAddress);
        fetchBalance(accountAddress);

        // Get user profile info
        const info = getUserInfo();
        setUserInfo(info);
      } catch (error) {
        console.error("Error loading account data:", error);
      }
    };

    loadAccountData();
  }, [isConnected, smartAccount, getUserInfo, chainId, fetchBalance]);

  /**
   * Opens the Particle Network fiat on-ramp in a new window
   */
  const handleOnRamp = () => {
    const onRampUrl = `https://ramp.particle.network/?fiatCoin=USD&cryptoCoin=ETH&network=Ethereum&theme=dark&language=en`;
    window.open(onRampUrl, "_blank");
  };

  /**
   * Sends a gasless transaction using Particle's native AA provider
   */
  const executeTxNative = async () => {
    if (!smartAccount || !recipientAddress) return;

    setIsSending(true);
    try {
      // Prepare transaction parameters
      const tx = {
        to: recipientAddress as `0x${string}`,
        value: parseEther("0.01").toString(),
        data: "0x",
      };

      // Get fee quotes for gasless transaction
      const feeQuotesResult = await smartAccount.getFeeQuotes(tx);
      const gaslessQuote = feeQuotesResult?.verifyingPaymasterGasless;

      if (!gaslessQuote) {
        throw new Error("Failed to get gasless fee quote");
      }

      // Send the user operation
      const hash = await smartAccount.sendUserOperation({
        userOp: gaslessQuote.userOp,
        userOpHash: gaslessQuote.userOpHash,
      });

      setTransactionHash(hash);
    } catch (error) {
      console.error("Error sending native transaction:", error);
    } finally {
      setIsSending(false);
    }
  };

  /**
   * Sends a gasless transaction using ethers.js provider
   */
  const executeTxEthers = async () => {
    if (!customProvider || !recipientAddress) return;

    setIsSending(true);
    try {
      const signer = await customProvider.getSigner();
      const tx = {
        to: recipientAddress as `0x${string}`,
        value: parseEther("0.01"),
      };

      const response = await signer.sendTransaction(tx);
      setTransactionHash(response.hash);
    } catch (error) {
      console.error("Error sending ethers transaction:", error);
    } finally {
      setIsSending(false);
    }
  };

  /**
   * Signs a message using the wallet client
   */
  const signMessage = async () => {
    if (!walletClient || !address) return;

    try {
      const message = `Sign a message - timestamp: ${Date.now()}`;
      const signature = await walletClient.signMessage({
        message,
        account: address as `0x${string}`,
      });

      if (signature) {
        // Use Viem to verify the signature
        const validSignature = await verifyMessage({
          address: address as `0x${string}`,
          message,
          signature,
        });
        alert(`Signature: ${signature}\nValid signature?: ${validSignature}`);
        console.log("Valid message signature:", validSignature);
      }
    } catch (error) {
      console.error("Error signing message:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <Header />
      <div className="w-full flex justify-center mt-4">
        <ConnectButton />
      </div>

      {isConnected ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 max-w-6xl mx-auto">
            {/* Account Information Card */}
            <div className="border border-purple-500 p-6 rounded-lg bg-gray-800 shadow-xl">
              <h2 className="text-2xl font-bold mb-4 text-purple-400">
                Account Information
              </h2>

              {/* User Profile */}
              {userInfo && (
                <div className="mb-6 flex items-center space-x-4 bg-gray-700 p-4 rounded-lg">
                  <img
                    src={userInfo.avatar}
                    alt="User Avatar"
                    className="w-12 h-12 rounded-full border-2 border-purple-500"
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-purple-300">
                      {userInfo.name}
                    </h3>
                    <p className="text-gray-400">
                      Connected via {userInfo?.thirdparty_user_info.provider}
                    </p>
                  </div>
                </div>
              )}

              {/* Account Details */}
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-gray-700 p-3 rounded-lg">
                  <span className="text-gray-400">Address</span>
                  <div className="flex items-center">
                    <code className="text-purple-300">
                      {truncateAddress(userAddress) || "Loading..."}
                    </code>
                    <button
                      className="ml-2 p-2 hover:bg-purple-700 rounded-full transition-colors"
                      onClick={() => copyToClipboard(userAddress)}
                      title="Copy Address"
                    >
                      📋
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-gray-700 p-3 rounded-lg">
                  <span className="text-gray-400">Network</span>
                  <code className="text-purple-300">
                    {chain?.name || "Loading..."}
                  </code>
                </div>

                <div className="flex items-center justify-between bg-gray-700 p-3 rounded-lg">
                  <span className="text-gray-400">Balance</span>
                  <div className="flex items-center">
                    <span className="text-purple-300">
                      {balance || "Loading..."}
                    </span>
                    <button
                      className="ml-2 p-2 hover:bg-purple-700 rounded-full transition-colors"
                      onClick={() => fetchBalance(userAddress)}
                      title="Refresh Balance"
                    >
                      🔄
                    </button>
                  </div>
                </div>
              </div>

              {/* Buy Crypto Button */}
              <button
                className="mt-6 w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg flex items-center justify-center space-x-2"
                onClick={handleOnRamp}
              >
                <span>💳</span>
                <span>Buy Crypto with Fiat</span>
              </button>
            </div>

            {/* Transaction Card */}
            <div className="border border-purple-500 p-6 rounded-lg bg-gray-800 shadow-xl">
              <h2 className="text-2xl font-bold mb-4 text-purple-400">
                Gasless Transactions
              </h2>
              <p className="text-gray-400 mb-4">
                Send {chain?.nativeCurrency.symbol} without paying gas fees
              </p>

              {/* Transaction Form */}
              <input
                type="text"
                placeholder="Enter recipient address (0x...)"
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                className="w-full p-3 rounded-lg border border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />

              {/* Action Buttons */}
              <div className="mt-6 space-y-3">
                <button
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2"
                  onClick={executeTxNative}
                  disabled={!recipientAddress || isSending}
                >
                  {isSending ? (
                    <>
                      <span className="animate-spin">⚡</span>
                      <span>Sending Transaction...</span>
                    </>
                  ) : (
                    <>
                      <span>📤</span>
                      <span>
                        Send with Particle (0.01 {chain?.nativeCurrency.symbol})
                      </span>
                    </>
                  )}
                </button>

                <button
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2"
                  onClick={executeTxEthers}
                  disabled={!recipientAddress || isSending}
                >
                  {isSending ? (
                    <>
                      <span className="animate-spin">⚡</span>
                      <span>Sending Transaction...</span>
                    </>
                  ) : (
                    <>
                      <span>📤</span>
                      <span>
                        Send with Ethers (0.01 {chain?.nativeCurrency.symbol})
                      </span>
                    </>
                  )}
                </button>

                <button
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2"
                  onClick={signMessage}
                >
                  <span>✍️</span>
                  <span>Sign Message</span>
                </button>
              </div>

              {/* Transaction Notification */}
              {transactionHash && (
                <div className="mt-4">
                  <TxNotification
                    hash={transactionHash}
                    blockExplorerUrl={chain?.blockExplorers?.default.url || ""}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Extra content below the cards */}
          <div className="mt-8 max-w-6xl mx-auto">
            <LinksGrid />
          </div>

          <ToastContainer />
        </>
      ) : (
        <div className="mt-8">
          <LinksGrid />
        </div>
      )}
    </div>
  );
}
