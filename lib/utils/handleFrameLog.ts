export const handleFrameLog = (log: string[], currentTurn: number) => {
    const previousTurnMarker = `Turn ${currentTurn}`;
    const nextTurnMarker = `Turn ${currentTurn + 1}`;

    // Find the index of the previous turn and next turn
    const previousTurnIndex = log.indexOf(previousTurnMarker);
    const nextTurnIndex = log.indexOf(nextTurnMarker);

    // If the previous turn exists, extract logs between the previous turn and the next turn (or the end of the array)
    if (previousTurnIndex !== -1) {
        return log.slice(previousTurnIndex, nextTurnIndex !== -1 ? nextTurnIndex : undefined);
    }

    // Return an empty array if the previous turn isn't found
    return [];
};
