export const fetchTopContributors = async () => {

  const response = await fetch(`https://api.nanograph.xyz/farcaster/channel/pokeframes/contributors`);

  const data = await response.json();

  // get first 3 entries

  return data.slice(0, 3);
}