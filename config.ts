import * as dotenv from 'dotenv';

dotenv.config();

export const BACKEND_URL = process.env.BACKEND_URL as string;
export const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY || "NEYNAR_API_DOCS" as string;
export const SHARE_INTENT = 'https://warpcast.com/~/compose?text=';
export const SHARE_TEXT = encodeURI(`Join me in this Pokemon Challenge!`);
export const SHARE_GACHA = encodeURI(`Look at this cool Pokemon I just caught!`);
export const SHARE_EMBEDS = '&embeds[]=';
export const FRAME_URL = ''; //// ADD LINK WHEN DEPLOYED
export const CHAIN_ID = 'eip155:11155111'; // 11155111 sepolia
export const CONTRACT_ADDRESS = '0x02f37D3C000Fb5D2A824a3dc3f1a29fa5530A8D4'; // ADD CONTRACT ADDRESS

export const POKEMON_CONTRACT_ADDRESS='0xab8f1a9d868a37e1aA95cDa6fC83ACc53B2A7495';
export const BATTLE_CONTRACT_ADDRESS='0xe319b04198e4192a28A4eCcB7E2ea4A26e2193Ce';
export const title = 'PokeFrame';