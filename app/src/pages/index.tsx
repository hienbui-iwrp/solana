import type { NextPage } from "next";
import React from "react";
import Head from "next/head";
import { useDemonAdapter } from "@renec-foundation/wallet-adapter-react";
const Home: NextPage = (props) => {
  const {anchorWallet: wallet, connectionContext: { connection}} = useDemonAdapter();
  return (
    <div>
     123
    </div>
  );
};

export default Home;
