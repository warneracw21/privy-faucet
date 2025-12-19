import {PrivyClient} from "@privy-io/node";

export const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID!;
export const PRIVY_APP_SECRET = process.env.PRIVY_APP_SECRET!;

export const ETHEREUM_WALLET_ID = 'gpfa5rglocsj2rhibycfmrk9';
export const SOLANA_WALLET_ID = 'wqejevr32w3kmtacsvtcgopd';

export const privy = new PrivyClient({
  appId: PRIVY_APP_ID,
  appSecret: PRIVY_APP_SECRET,
});

export const getAuthHeader = () => {
  return `Basic ${btoa(`${PRIVY_APP_ID}:${PRIVY_APP_SECRET}`)}`;
};

export const headers = {
  "Authorization": getAuthHeader(),
  "Content-Type": "application/json",
  'privy-app-id': process.env.NEXT_PUBLIC_PRIVY_APP_ID!,
};
