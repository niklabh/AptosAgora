import React from 'react';
import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { Toaster } from 'react-hot-toast';
import { 
  AptosWalletAdapterProvider
} from '@aptos-labs/wallet-adapter-react';
import { PetraWallet } from 'petra-plugin-wallet-adapter';
// Import the wallet adapter CSS with proper path
import '@aptos-labs/wallet-adapter-ant-design/dist/index.css';

function MyApp({ Component, pageProps }: AppProps) {
  // Create a list of wallet adapters
  const wallets = [new PetraWallet()];

  return (
    <AptosWalletAdapterProvider
      plugins={wallets}
      autoConnect={true}
      onError={(error) => {
        console.log("Error connecting to wallet: ", error);
      }}
    >
      <Component {...pageProps} />
      <Toaster position="bottom-right" />
    </AptosWalletAdapterProvider>
  );
}

export default MyApp; 