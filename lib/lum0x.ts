import { Lum0x } from "lum0x-sdk"
import * as dotenv from "dotenv"
dotenv.config();

Lum0x.init(process.env.LUM0X_API_KEY as string);

export const postLum0xTestFrameValidator = (async (
    fid: number,
    path: string,
) => {
    fetch("https://testnetapi.lum0x.com/frame/validation", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          farcasterFid: fid,
          frameUrl: `${process.env.BASE_URL}/api/${path}`,
        }),
      });
})

export const getFarcasterUserInfo = (async (
    fid?: number,
) => {
    const res = await Lum0x.farcasterUser.getUserByFids({
        fids: String(fid),
    })
    console.log(res);
    const { users } = res;
    const { pfp_url, username: userName, verified_addresses } = users[0];
    const verifiedAddresses = verified_addresses.eth_addresses;
    return { pfp_url, userName, verifiedAddresses };
})

export const getFarcasterUserInfoByAddress = async (address: `0x${string}`) => {
    const userInfo = await Lum0x.farcasterUser.getUserByBulkAddress({
        addresses: address,
        address_types: "verified_address",
    })
  
    const { users } = userInfo;
    const addressLowerCase = address.toLowerCase();
    const pfp_url = users[addressLowerCase]?.[0].pfp_url || '';
    const userName = users[addressLowerCase]?.[0].username || '???';
    const verifiedAddresses =
      users[addressLowerCase]?.[0].verified_addresses.eth_addresses || [];
  
    return { pfp_url, userName, verifiedAddresses };
  };