import { Provider as WalletProvider } from "@renec-foundation/wallet-adapter-react";
import type { AppProps } from "next/app";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "react-query";

// Require because we want them to be in order
require('@renec-foundation/wallet-adapter-react/src/style.css')
// set custom RPC server endpoint for the final website
// const endpoint = "https://explorer-api.devnet.solana.com";
// const endpoint = "http://127.0.0.1:8899";
const endpoint = "https://ssc-dao.genesysgo.net";


function MyApp({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(() => new QueryClient())
  return (
        <>asdjd</>
  );
}

export default MyApp;