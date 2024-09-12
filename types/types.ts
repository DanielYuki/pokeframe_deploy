export type Attack = {
    atk: string,
    type: PokemonType;
}

export type PokemonType = {
    name: string,
    color: string,
}

export type Battle = {
    id: string;
    maker: number;
    taker: number;
    maker_pokemons: any;
    maker_battling_pokemons: any;
    taker_pokemons: any;
    taker_battling_pokemons: any;
    maker_move: string;
    taker_move: string;
    status: string;
    current_turn: number;
    battle_log: string[]; 
}

export type Pokemon = {
    id: number;
    name: string;
    type: string[];
    hp: number;
    attack: number;
    defense: number;
    speed: number;
    moves: number[]; // this is the move id
    status: Status;
}

export type Moves = {
    id: number;
    name: string;
    type: string;
    power: number | null;
    accuracy: number | null;
    effect: string | null;
    onExecute: string; //this is a function
    priority: number;
}

export type Status = {
    currentHP: number;
    statusCondition: string | null;
    statusMultipliers: {
        attack: number;
        defense: number;
        speed: number;
        evasion: number;
        accuracy: number;
    }
}