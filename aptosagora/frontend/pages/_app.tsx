import React from 'react';
import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { Toaster } from 'react-hot-toast';
import { 
  AptosWalletAdapterProvider, 
  PetraWalletAdapter 
} from '@aptos-labs/wallet-adapter-react';

function MyApp({ Component, pageProps }: AppProps) {
  // Create a list of wallet adapters
  const wallets = [new PetraWalletAdapter()];

  return (
    <AptosWalletAdapterProvider
      plugins={wallets}
      autoConnect={true}
    >
      <Component {...pageProps} />
      <Toaster position="bottom-right" />
    </AptosWalletAdapterProvider>
  );
}

export default MyApp; 