<div align="center">
  <a href="https://particle.network/">
    <img src="https://i.imgur.com/xmdzXU4.png" />
  </a>
  <h3>
 @particle-network/connectkit @particle-network/aa Demo Application 
  </h3>
</div>

# Particle Connect Authentication via Passkey with Coinbase smart account

⚡️ Basic demo application using `@particle-network/connectkit` and `@particle-network/aa` to showcase how to leverage a Coinbase smart account with Passkey for onboarding and signing.

> Note that Account Abstraction is included within the new `connectkit` package. `@particle-network/aa` is required when using an EIP 1193 provider like ethers.js.
> This demo showcases both options.

This app lets you log in using Passkey, view account information, and send a gasless transfer to an address entered in the UI.

**What is Passkey?**  
Passkey is a passwordless authentication method that enables users to log in securely using biometric data, device PINs, or other forms of strong authentication, providing a simpler and more secure onboarding experience.

Learn more about integrating [Authentication via Passkey](https://developers.particle.network/api-reference/connect/desktop/web#authentication-via-passkey) on the Particle docs.

> The Next application is within the `connectkit-aa-usage` directory.

Built using `create @particle-network/connectkit`

```sh
npm init @particle-network/connectkit@latest
# or
pnpm create @particle-network/connectkit@latest
# or
yarn create @particle-network/connectkit
```

Follow the instructions:

```sh
🤩 Welcome to Particle Network!

✔ What is the name of your project? … connectkit-aa-usage

✔ What is the template of your project? › create-next-app
✔ Which chains does your app support?​ › EVM
✔ Which ERC-4337 Contract does your app support?​ › BICONOMY-2.0.0
✔ Does it support an embedded wallet?​ … yes
```

Plus:

- **Particle AA SDK**
- **ethers.js V6.x.x**

## 🔑 Particle Connect

**Particle Connect** enables a unified modal driving connection with social logins (through Particle Auth) and standard Web3 wallets, creating an equally accessible experience for Web3 natives and traditional consumers. Particle Connect is an all-in-one SDK capable of handling end-to-end onboarding and wallet connection.

This app enables you to log in using social logins or Web3 methods via Particle Connect and interact with the Ethereum Sepolia, Base Sepolia, and Avalanche Fuji testnets. You can view your account information and send transfer transactions to any address you input in the UI.

👉 Learn more about [Particle Connect](https://developers.particle.network/api-reference/connect/desktop/web).

## 🪪 Account Abstraction SDK

Particle Network natively supports and facilitates the end-to-end utilization of ERC-4337 account abstraction. This is primarily done through the account abstraction SDK, which can construct, sponsor, and send UserOperations, deploy smart accounts, retrieve fee quotes, and perform other key functions.

> Every gasless transaction is automatically sponsored on testnet. On mainnet, you'll need to deposit USDT in the Paymaster.

👉 Learn more about the [Particle AA SDK](https://developers.particle.network/docs/aa-web-quickstart).

***

👉 Learn more about [Particle Network](https://particle.network).

## 🛠️ Quickstart

### Clone this repository
```
git clone https://github.com/soos3d/particle-auth-nextjs-aa
```

### Move into the app directory

```sh
cd connectkit-aa-usage
```

### Install dependencies

```sh
yarn install
```

Or

```sh
npm install
```

### Set environment variables
This project requires several keys from Particle Network to be defined in `.env`. The following should be defined:
- `NEXT_PUBLIC_PROJECT_ID`, the ID of the corresponding application in your [Particle Network dashboard](https://dashboard.particle.network/#/applications).
- `NEXT_PUBLIC_CLIENT_KEY`, the ID of the corresponding project in your [Particle Network dashboard](https://dashboard.particle.network/#/applications).
-  `NEXT_PUBLIC_APP_ID`, the client key of the corresponding project in your [Particle Network dashboard](https://dashboard.particle.network/#/applications).

### Start the project
```sh
npm run dev
```

Or

```sh
yarn dev
```

## Development

Particle Connect config is in `src/components/ConnectKit.tsx`. 

### Config social logins

List of available social logins:

```sh
{
  email: 'email',
  phone: 'phone',
  facebook: 'facebook',
  google: 'google',
  apple: 'apple',
  twitter: 'twitter',
  discord: 'discord',
  github: 'github',
  twitch: 'twitch',
  microsoft: 'microsoft',
  linkedin: 'linkedin',
  jwt: 'jwt'
}
```

### Smart Account (AA) Options

You can configure the smart account using the `aa` plugin located in `src/components/ConnectKit.tsx`. Below is an example configuration:

```tsx
plugins: [
  // Smart Account (AA) configuration
  aa({
    name: "COINBASE",
    version: "1.0.0",
  }),
],
```

#### Available Smart Accounts

Here is a list of supported smart accounts and their corresponding versions and chain IDs:

- **`BICONOMY`**: A [Biconomy Smart Account](https://www.biconomy.io/smart-accounts).
  - **Versions**: `1.0.0`, `2.0.0`
  - **Chain IDs**: Specify relevant chain IDs as needed.

- **`CYBERCONNECT`**: A [CyberConnect Smart Account](https://wallet.cyber.co/).
  - **Version**: `1.0.0`
  - **Chain IDs**: Specify relevant chain IDs as needed.

- **`SIMPLE`**: A [SimpleAccount Implementation](https://github.com/eth-infinitism/account-abstraction/blob/develop/contracts/samples/SimpleAccount.sol).
  - **Versions**: `1.0.0`, `2.0.0`
  - **Chain IDs**: Specify relevant chain IDs as needed.

- **`LIGHT`**: A [Light Account Implementation by Alchemy](https://github.com/alchemyplatform/light-account).
  - **Version**: `1.0.2`
  - **Chain IDs**: Specify relevant chain IDs as needed.

- **`XTERIO`**: A [Xterio Smart Account](https://xter.io/build).
  - **Version**: `1.0.0`
  - **Chain IDs**: Specify relevant chain IDs as needed.

> Check the [Particle AA Docs](https://developers.particle.network/api-reference/aa/sdks/desktop/web#initialization) to verify up to date information.

#### Sending AA Transactions

You can send gasless transactions using the native `smartAccount` instance provided by Particle Connect. 

This does not require the Particle AA ADK.

Here’s an example from the demo:

```tsx
import { useSmartAccount } from "@particle-network/connectkit";
const smartAccount = useSmartAccount();

/**
 * Sends a transaction using the native AA Particle provider with gasless mode.
 */
const executeTxNative = async () => {
  setIsSending(true);
  try {
    const tx = {
      to: recipientAddress,
      value: parseEther("0.01").toString(),
      data: "0x",
    };

    // Fetch fee quotes and use verifyingPaymasterGasless for a gasless transaction
    const feeQuotesResult = await smartAccount?.getFeeQuotes(tx);
    const { userOp, userOpHash } =
      feeQuotesResult?.verifyingPaymasterGasless || {};

    if (userOp && userOpHash) {
      const txHash =
        (await smartAccount?.sendUserOperation({
          userOp,
          userOpHash,
        })) || null;

      setTransactionHash(txHash);
      console.log("Transaction sent:", txHash);
    } else {
      console.error("User operation is undefined");
    }
  } catch (error) {
    console.error("Failed to send transaction:", error);
  } finally {
    setIsSending(false);
  }
};
```

For users utilizing an EIP1193 provider such as `ethers.js`, you'll need to leverage the Particle AA SDK. Install it with the following command:

```sh
yarn add @particle-network/aa
```

Here’s how to use it with `ethers.js`:

```tsx
// Initialize custom provider with gasless transaction mode
const customProvider = smartAccount
  ? new ethers.BrowserProvider(
      new AAWrapProvider(
        smartAccount,
        SendTransactionMode.Gasless
      ) as Eip1193Provider,
      "any"
    )
  : null;

/**
 * Sends a transaction using the ethers.js library.
 * This transaction is gasless since the customProvider is initialized as gasless.
 */
const executeTxEthers = async () => {
  if (!customProvider) return;

  const signer = await customProvider.getSigner();
  setIsSending(true);
  try {
    const tx = {
      to: recipientAddress,
      value: parseEther("0.01").toString(),
    };

    const txResponse = await signer.sendTransaction(tx);
    const txReceipt = await txResponse.wait();

    setTransactionHash(txReceipt?.hash || null);
  } catch (error) {
    console.error("Failed to send transaction using ethers.js:", error);
  } finally {
    setIsSending(false);
  }
};
```
