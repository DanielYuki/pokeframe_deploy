export const fetchTopContributors = async () => {
    const response = await fetch(
        `https://api.nanograph.xyz/farcaster/channel/farhack/contributors` // MUST CHANGE TO pokeframes CHANNEL (USING farhack CHANNEL FOR DEMO PURPOSES)
    );
    const data = await response.json();
    // get first 3 entries
    return data.slice(0, 3);
};
