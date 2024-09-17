import sharp from "sharp";
import { Attack, Pokemon } from "../types/types.js";

import { attackType, hpHp, hpSVG, moves, moves2, pokemonSVG, statsBox1, statsBox2, statusPokemon, typeBox, typeBox2 } from "./functions.js";
import { getPokemonTypeColor } from "./pkmTypeColor.js";
import { getFarcasterUserInfo } from "../lib/lum0x.js";

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
// import { handle } from "frog/vercel";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const generateGame = async (
    pokemon1Name: string,
    pokemon1Id: number,
    pokemon2Name: string,
    pokemon2Id: number,
    totalHP1: number,
    currentHp1: number,
    totalHP2: number,
    currentHp2: number,
    id: number
  ) => {
    try {
  
      // have to rewrite this a little better later (and maybe do it in a separate file as a function)
      const gameComponents = (() => {
        const components = [];
  
  
        const hp1SVG = hpSVG(currentHp1, totalHP1);
        const hp2SVG = hpSVG(currentHp2, totalHP2);
        const box1 = statsBox1();
        const box2 = statsBox2();
        
        components.push({ input: Buffer.from(box1), top: 40, left: 0 });
        components.push({ input: Buffer.from(box2), top: 238, left: 380 });
        components.push({ input: Buffer.from(hp1SVG), top: 272, left: 420 });
        components.push({ input: Buffer.from(hp2SVG), top: 75, left: 10 });
        const pokemon1SVG = pokemonSVG(pokemon1Name);
        const pokemon2SVG = pokemonSVG(pokemon2Name);
        components.push({ input: Buffer.from(pokemon1SVG), top: 235, left: 420 });
        components.push({ input: Buffer.from(pokemon2SVG), top: 40, left: 10 });
  
        return components;
      })
      const baseImageBuffer = await sharp(join(__dirname, `../public/images/battle-scenes/${id}.png`))
      .png()
      .toBuffer();

      const battleImageBuffer = await sharp(join(__dirname, '../public/images/battle-scenes/1.png'))
        .resize(630, 379)
        .png()
        .toBuffer();
  
      const gameComponentsArray = gameComponents();
  
      const pokemon1ImageBuffer = await sharp(join(__dirname, `../public/images/pokemons/back/${pokemon1Id}.png`)) //show back of the pokemon
        .resize(280, 280)
        .png()
        .toBuffer();
  
      const pokemon2ImageBuffer = await sharp(join(__dirname, `../public/images/pokemons/${pokemon2Id}.png`))
        .resize(200, 200)
        .png()
        .toBuffer();
  
      const hphp = hpHp(currentHp1, totalHP1);
      gameComponentsArray.push({ input: pokemon1ImageBuffer, top: 100, left: 55 });
      gameComponentsArray.push({ input: pokemon2ImageBuffer, top: 30, left: 400 });
      gameComponentsArray.push({ input: Buffer.from(hphp), top: 295, left: 553 });
      const battleBg = [];
      battleBg.push({input: battleImageBuffer, top:0, left: 44});
      const finalImage = await sharp(baseImageBuffer)
        .composite(battleBg)
        .composite(gameComponentsArray)
        .png()
        .toBuffer();
  
      // console.log("Final image composed successfully");
  
      return finalImage;
    } catch (error) {
      console.error("Error during game generation:", error);
      throw error;
    }
}

export const generateFight = async (
    pokemonName: string,
    pokemonId: number,
    totalHp: number,
    currentHp: number,
    attacks: Attack [],
    // stats: any
  ) => {
    try {
      const fightComponents = (() => {
        const components = [];
        const sentence = `        
          <svg width="600" height="65">
            <text x="0" y="32" text-anchor="left" font-size="30" fill="white">What will ${pokemonName} do?</text>
          </svg>
        `;
        components.push({ input: Buffer.from(sentence), top: 40, left: 60 });
        const atk1 = moves(attacks[0].atk);
        const atk2 = moves(attacks[1].atk);
        const atk3 = moves(attacks[2].atk);
        const back = `
          <svg width="220" height="75">
            <text x="15" y="25" text-anchor="left" font-size="35" fill="white">BACK</text>
          </svg>         
        `
        const hphp = hpHp(currentHp, totalHp);
        const pokemon1SVG = pokemonSVG(pokemonName);
        const hp1SVG = hpSVG(currentHp, totalHp);
        /* const attack = statusPokemon(stats.atk);
        const defense = statusPokemon(stats.def);
        const speed = statusPokemon(stats.spd); */
        //const accuracy = statusPokemon('6');
        //const evasiveness = statusPokemon('6');
        components.push({ input: Buffer.from(atk1), top: 183, left: 59 });
        components.push({ input: Buffer.from(atk2), top: 183, left: 324 });
        components.push({ input: Buffer.from(atk3), top: 313, left: 59 });
        components.push({ input: Buffer.from(back), top: 340, left: 330 });
        components.push({ input: Buffer.from(hphp), top: 526, left: 156 });
        components.push({ input: Buffer.from(pokemon1SVG), top: 455, left: 154 });
        components.push({ input: Buffer.from(hp1SVG), top: 494, left: 154 });
        components.push({  input: Buffer.from(typeBox(attacks[0])), top:226, left:58 });
        components.push({  input: Buffer.from(attackType(attacks[0])), top:226, left:58 });
        components.push({  input: Buffer.from(typeBox(attacks[1])), top:226, left:323 });
        components.push({  input: Buffer.from(attackType(attacks[1])), top:226, left:323 });
        components.push({  input: Buffer.from(typeBox(attacks[2])), top:355, left:60 });
        components.push({  input: Buffer.from(attackType(attacks[2])), top:355, left:60 });
        /* components.push({  input: Buffer.from(attack), top:202, left:133 });
        components.push({  input: Buffer.from(defense), top:231, left:133 });
        components.push({  input: Buffer.from(speed), top:257, left:133 });
        components.push({  input: Buffer.from(accuracy), top:292, left:133 });
        components.push({  input: Buffer.from(evasiveness), top:316, left:133 }); */

        return components;
     })

    const fightComponentsArray = fightComponents();
    const baseImageBuffer = await sharp(join(__dirname, '../public/images/battle-fight.png'))
    .resize(600, 600)
    .png()
    .toBuffer();
    const pokemon1ImageBuffer = await sharp(join(__dirname, `../public/images/pokemons/${pokemonId}.png`))
    .resize(108, 108)
    .png()
    .toBuffer();

    fightComponentsArray.push({input: pokemon1ImageBuffer, top: 438, left: 41});
    const finalImage = await sharp(baseImageBuffer)
    .composite(fightComponentsArray)
    .png()
    .toBuffer();

    return finalImage;
    } catch(error) {
        console.error("Error during fight menu generation:", error);
        throw error;
    }
}

export const generateBattleConfirm = async (
  pokemonIds: number[],
) => {
  try {
  const ComponentsArray = [];
  
  const baseImageBuffer = await sharp(join(__dirname, '../public/images/battle-checkout.png'))
  .resize(600, 600)
  .png()
  .toBuffer();

  const pokemon1ImageBuffer = await sharp(join(__dirname, `../public/images/pokemons/${pokemonIds[0]}.png`))
  .resize(125, 125)
  .png()
  .toBuffer();

  const pokemon2ImageBuffer = await sharp(join(__dirname, `../public/images/pokemons/${pokemonIds[1]}.png`))
  .resize(125, 125)
  .png()
  .toBuffer();

  const pokemon3ImageBuffer = await sharp(join(__dirname, `../public/images/pokemons/${pokemonIds[2]}.png`))
  .resize(125, 125)
  .png()
  .toBuffer();

  ComponentsArray.push({input: pokemon1ImageBuffer, top: 191, left: 68});
  ComponentsArray.push({input: pokemon2ImageBuffer, top: 191, left: 238});
  ComponentsArray.push({input: pokemon3ImageBuffer, top: 191, left: 409});
  const finalImage = await sharp(baseImageBuffer)
  .composite(ComponentsArray)
  .png()
  .toBuffer();

  return finalImage;
  } catch(error) {
      console.error("Error during battle checkout generation:", error);
      throw error;
  }
}

export const generateWaitingRoom = async (
  // pfp_url: string,
) => {
  try {
  const ComponentsArray = [];
  
  const baseImageBuffer = await sharp(join(__dirname, '../public/images/waiting-room.png'))
  .resize(600, 600)
  .png()
  .toBuffer();

  const usr1ImageBuffer = await sharp(join(__dirname, '../public/images/pokemons/25.png'))
  .resize(170, 170)
  .png()
  .toBuffer();

  ComponentsArray.push({input: usr1ImageBuffer, top: 324, left: 48});

  const finalImage = await sharp(baseImageBuffer)
  .composite(ComponentsArray)
  .png()
  .toBuffer();

  return finalImage;
  } catch(error) {
      console.error("Error during battle checkout generation:", error);
      throw error;
  }
}

export const generateBattleReady = async (
  maker_pokemons: Pokemon[],
  taker_pokemons: Pokemon[]
) => {
  try {
  const ComponentsArray = [];
  
  const baseImageBuffer = await sharp(join(__dirname, '../public/images/battle-ready.png'))
  .resize(600, 600)
  .png()
  .toBuffer();

  const usr1P1ImageBuffer = await sharp(join(__dirname, `../public/images/pokemons/${maker_pokemons[0].id}.png`))
  .resize(170, 170)
  .png()
  .toBuffer();

  const usr1P2ImageBuffer = await sharp(join(__dirname, `../public/images/pokemons/${maker_pokemons[1].id}.png`))
  .resize(170, 170)
  .png()
  .toBuffer();

  const usr1P3ImageBuffer = await sharp(join(__dirname, `../public/images/pokemons/${maker_pokemons[2].id}.png`))
  .resize(160, 160)
  .png()
  .toBuffer();

  const usr2P1ImageBuffer = await sharp(join(__dirname, `../public/images/pokemons/${taker_pokemons[0].id}.png`))
  .resize(160, 160)
  .png()
  .toBuffer();

  const usr2P2ImageBuffer = await sharp(join(__dirname, `../public/images/pokemons/${taker_pokemons[1].id}.png`))
  .resize(160, 160)
  .png()
  .toBuffer();

  const usr2P3ImageBuffer = await sharp(join(__dirname, `../public/images/pokemons/${taker_pokemons[2].id}.png`))
  .resize(160, 160)
  .png()
  .toBuffer();

  ComponentsArray.push({input: usr1P1ImageBuffer, top: 23, left: 10});
  ComponentsArray.push({input: usr1P2ImageBuffer, top: 23, left: 214});
  ComponentsArray.push({input: usr1P3ImageBuffer, top: 243, left: 10});
  ComponentsArray.push({input: usr2P1ImageBuffer, top: 390, left: 170});
  ComponentsArray.push({input: usr2P2ImageBuffer, top: 390, left: 390});
  ComponentsArray.push({input: usr2P3ImageBuffer, top: 193, left: 390});

  const finalImage = await sharp(baseImageBuffer)
  .composite(ComponentsArray)
  .png()
  .toBuffer();

  return finalImage;
  } catch(error) {
      console.error("Error during battle checkout generation:", error);
      throw error;
  }
}

export const generateBattleListV0 = async (data: { battles: any[] }) => {
  try {
    const { battles } = data;

    if (!Array.isArray(battles)) {
      throw new Error('Invalid data: battles must be an array.');
    }

    const ComponentsArray: sharp.OverlayOptions[] = [];

    // Load the base image
    const baseImageBuffer = await sharp(join(__dirname, '../public/images/battle-scenes/0.png')) //TODO: Change for the correct image
      .resize(600, 600)
      .png()
      .toBuffer();

    for (const [index, battle] of battles.entries()) {
      const battleId = battle.id;
      const maker = battle.maker;
      const makerPokemons = JSON.parse(battle.maker_pokemons);
      const pokemonIds = makerPokemons.map((pokemon: { id: number }) => pokemon.id);
      const isCompetitive = battle.is_competitive ? 'Competitive' : 'Casual';

      console.log(pokemonIds); // [1, 2, 3]

      // Create SVG for each battle property
      const makerSVG = `
        <svg width="600" height="50">
          <text x="10" y="40" font-size="30" fill="white">${maker}</text>
        </svg>
        `;// TODO: Change for the user name

      const isCompetitiveSVG = `
      <svg width="600" height="50">
      <text x="10" y="40" font-size="30" fill="white">${isCompetitive}</text>
      </svg>
      `;
      const battleIdSVG = `
        <svg width="600" height="50">
          <text x="10" y="40" font-size="30" fill="white">${battleId}</text>
        </svg>
        `;
      
      const usr1ImageBuffer = await sharp(join(__dirname, `../public/images/pokemons/icons/${pokemonIds[0]}.png`))
        .resize(100, 100)
        .png()
        .toBuffer();
      const usr2ImageBuffer = await sharp(join(__dirname, `../public/images/pokemons/icons/${pokemonIds[1]}.png`))
        .resize(100, 100)
        .png()
        .toBuffer();
      const usr3ImageBuffer = await sharp(join(__dirname, `../public/images/pokemons/icons/${pokemonIds[2]}.png`))
        .resize(100, 100)
        .png()
        .toBuffer();

      // Calculate the vertical position for each block
      const verticalOffset = 50 + (50 * index);

      // Add components to the array with calculated positions
      ComponentsArray.push({ input: Buffer.from(makerSVG), top: verticalOffset, left: 30 });
      ComponentsArray.push({ input: usr1ImageBuffer, top: verticalOffset - 50, left: 200 });
      ComponentsArray.push({ input: usr2ImageBuffer, top: verticalOffset - 50, left: 250 });
      ComponentsArray.push({ input: usr3ImageBuffer, top: verticalOffset - 50, left: 300 });
      ComponentsArray.push({ input: Buffer.from(isCompetitiveSVG), top: verticalOffset, left: 400 });
      ComponentsArray.push({ input: Buffer.from(battleIdSVG), top: verticalOffset, left: 550 });
    }

    // Composite the final image
    const finalImage = await sharp(baseImageBuffer)
      .composite(ComponentsArray)
      .png()
      .toBuffer();

    return finalImage;
  } catch (error) {
    console.error('Error during battle checkout generation:', error);
    throw error;
  }
};

export const generateLastTurnBattleLog = async (handleFrameLog: string[]) => {
  try {
    if (!Array.isArray(handleFrameLog)) {
      throw new Error('Invalid data: battle log must be an array.');
    }

    const ComponentsArray: sharp.OverlayOptions[] = [];

    console.log(handleFrameLog);

    // Load the base image
    const baseImageBuffer = await sharp(join(__dirname, '../public/images/battle-scenes/0.png')) //TODO: Change for the correct image
      .resize(600, 600)
      .png()
      .toBuffer();
    
    const battleLogHeader = `
      <svg width="600" height="50">
        <text x="10" y="40" font-size="30" fill="white">LAST TURN BATTLE LOG</text>
      </svg>
    `;

    ComponentsArray.push({ input: Buffer.from(battleLogHeader), top: 10, left: 10 });

    if(handleFrameLog.length != 0) {
      for (const [index, log] of handleFrameLog.entries()) {
        
        const battleLogText = `
        <svg width="600" height="50">
          <text x="10" y="40" font-size="30" fill="white">${log}</text>
        </svg>
        `;

      // Calculate the vertical position for each block
      const verticalOffset = 50 + (50 * index);

      // Add components to the array with calculated positions
      ComponentsArray.push({ input: Buffer.from(battleLogText), top: verticalOffset, left: 10 });
    }
  }
    
    // Composite the final image
    const finalImage = await sharp(baseImageBuffer)
      .composite(ComponentsArray)
      .png()
      .toBuffer();

    return finalImage;
  } catch (error) {
    console.error('Error during last turn battle log generation:', error);
    throw error;
  }
}


function prettyName(inputString: string): string {
  let lowerString = inputString.toLowerCase();
  let resultString = lowerString.charAt(0).toUpperCase() + lowerString.slice(1);
  return resultString;
}

export const generatePokemonCard = async (
  pokemonId: number,
  pokemonName: string,
  pokemonType: string,
  pokemonHp: number,
  pokemonAtk: number,
  pokemonDef: number,
  pokemonSpd: number,
) => {
  try {
  const ComponentsArray = [];
  
  const baseImageBuffer = await sharp(join(__dirname, '../public/images/pokemons-base.png'))
  .resize(600, 600)
  .png()
  .toBuffer();

  const usr1ImageBuffer = await sharp(join(__dirname, `../public/images/pokemons/${pokemonId}.png`))
  .resize(300, 300)
  .png()
  .toBuffer();

  const usr2ImageBuffer = await sharp(join(__dirname, `../public/images/pokemons/icons/${pokemonId-1}.png`))
  .resize(100, 100)
  .png()
  .toBuffer();

  const usr3ImageBuffer = await sharp(join(__dirname, `../public/images/pokemons/icons/${pokemonId+1}.png`))
  .resize(100, 100)
  .png()
  .toBuffer();

  const pokemon = `
    <svg width="248" height="65">
      <text x="0" y="48" text-anchor="left" font-weight="bold" font-size="45" fill="white">${prettyName(pokemonName)}</text>
    </svg>        
    `

  const id = `
    <svg width="248" height="65">
      <text x="0" y="48" text-anchor="left" font-weight="bold" font-size="45" fill="white">#${pokemonId}</text>
    </svg>        
  `

  const statsBar = ((stats: number) => {
    return `
      <svg width="178" height="7" fill="none">
        <rect width="178" height="7" rx="3.5" fill="#F3EEEE"/>
        <rect width="${stats*2}" height="7" rx="3.5" fill="${stats < 50 ? "#FF4242" : "#33BC56"}"/>
      </svg>
    `
  })

  const pokeType = ((pokemonTypeColor: string) => {
    return `
    <svg width="154" height="65" fill="none">
      <rect width="154" height="64.1667" rx="32.0833" fill="${getPokemonTypeColor(pokemonTypeColor)}"/>
    </svg>
    `
  })

  const typeText = `
  <svg width="248" height="65">
    <text x="120" y="48" text-anchor="middle" font-weight="bold" font-size="22" fill="white">${(pokemonType).toUpperCase()}</text>  </svg>        
  `

  ComponentsArray.push({input: usr1ImageBuffer, top: 160, left: 0});
  ComponentsArray.push({input: usr2ImageBuffer, top: 490, left: 27});
  ComponentsArray.push({input: usr3ImageBuffer, top: 490, left: 470});
  ComponentsArray.push({input: Buffer.from(pokemon), top: 46, left: 328});
  ComponentsArray.push({input: Buffer.from(pokeType(pokemonType)), top: 140, left: 328});
  ComponentsArray.push({input: Buffer.from(typeText), top: 130, left: 285});
  ComponentsArray.push({input: Buffer.from(id), top: 46, left: 20});
  ComponentsArray.push({input: Buffer.from(statsBar(pokemonHp)), top: 248, left: 412});
  ComponentsArray.push({input: Buffer.from(statsBar(pokemonAtk)), top: 297, left: 412});
  ComponentsArray.push({input: Buffer.from(statsBar(pokemonDef)), top: 346, left: 412});
  ComponentsArray.push({input: Buffer.from(statsBar(pokemonSpd)), top: 395, left: 412});

  const finalImage = await sharp(baseImageBuffer)
  .composite(ComponentsArray)
  .png()
  .toBuffer();

  return finalImage;
  } catch(error) {
      console.error("Error during battle checkout generation:", error);
      throw error;
  }
}

export const generatePokemonMenu = async (
  pokemonName1: string,
  pokemonId1: number,
  pokemonName2: string,
  pokemonId2: number,  
  totalHp1: number,
  currentHp1: number,
  totalHp2: number,
  currentHp2: number,
  attacks: Attack [],
) => {
  try {
    const fightComponents = (() => {
      const components = [];
      const atk1 = moves2(attacks[0].atk);
      const atk2 = moves2(attacks[1].atk);
      const atk3 = moves2(attacks[2].atk);

      const pokemon1SVG = pokemonSVG(pokemonName1);
      const pokemon2SVG = pokemonSVG(pokemonName2);
      const hp1SVG = hpSVG(currentHp1, totalHp1);
      const hp2SVG = hpSVG(currentHp2, totalHp2);
      const hphp1 = hpHp(currentHp1, totalHp1);
      const hphp2 = hpHp(currentHp2, totalHp2);
      const attack = statusPokemon('6');
      const defense = statusPokemon('6');
      const speed = statusPokemon('6');
      const accuracy = statusPokemon('6');
      const evasiveness = statusPokemon('6');
      components.push({ input: Buffer.from(atk1), top: 189, left: 309 });
      components.push({ input: Buffer.from(atk2), top: 241, left: 309 });
      components.push({ input: Buffer.from(atk3), top: 293, left: 309 });
      components.push({ input: Buffer.from(pokemon1SVG), top: 44, left: 143 });
      components.push({ input: Buffer.from(pokemon2SVG), top: 435, left: 143 });
      components.push({ input: Buffer.from(hp1SVG), top: 89, left: 144 });
      components.push({ input: Buffer.from(hp2SVG), top: 480, left: 144 });
      components.push({ input: Buffer.from(hphp1), top: 121, left: 144 });
      components.push({ input: Buffer.from(hphp2), top: 512, left: 144 });
      components.push({  input: Buffer.from(typeBox2(attacks[0])), top:189, left:445 });
      components.push({  input: Buffer.from(attackType(attacks[0])), top:189, left:445 });
      components.push({  input: Buffer.from(typeBox2(attacks[1])), top:241, left:445 });
      components.push({  input: Buffer.from(attackType(attacks[1])), top:241, left:445 });
      components.push({  input: Buffer.from(typeBox2(attacks[2])), top:293, left:445 });
      components.push({  input: Buffer.from(attackType(attacks[2])), top:293, left:445 });
      components.push({  input: Buffer.from(attack), top:192, left:133 });
      components.push({  input: Buffer.from(defense), top:221, left:133 });
      components.push({  input: Buffer.from(speed), top:247, left:133 });
      components.push({  input: Buffer.from(accuracy), top:282, left:133 });
      components.push({  input: Buffer.from(evasiveness), top:306, left:133 });

      return components;
   })

  const fightComponentsArray = fightComponents();
  const baseImageBuffer = await sharp(join(__dirname, '../public/images/in-battle-change-pokemon.png'))
  .resize(600, 600)
  .png()
  .toBuffer();

  const pokemon1ImageBuffer = await sharp(join(__dirname, `../public/images/pokemons/${pokemonId1}.png`))
  .resize(108, 108)
  .png()
  .toBuffer();

  const pokemon2ImageBuffer = await sharp(join(__dirname, `../public/images/pokemons/${pokemonId2}.png`))
  .resize(108, 108)
  .png()
  .toBuffer();

  fightComponentsArray.push({input: pokemon1ImageBuffer, top: 33, left: 31});
  fightComponentsArray.push({input: pokemon2ImageBuffer, top: 435, left: 30});
  const finalImage = await sharp(baseImageBuffer)
  .composite(fightComponentsArray)
  .png()
  .toBuffer();

  return finalImage;
  } catch(error) {
      console.error("Error during fight menu generation:", error);
      throw error;
  }
}

export const generateBattleList = async (
  pokemonIds: number[],
  profilePicURL: string,
  userName: string,
) => {
  try {
  const ComponentsArray = [];

  const challengerName = `
    <svg width="600" height="50">
      <text x="10" y="40" font-size="36" fill="white">Trainer ${userName} is ready for a battle</text>
    </svg>
  `;

  const pfpSize = 170;
  const circleMask = Buffer.from(
    `<svg><circle cx="${pfpSize / 2}" cy="${pfpSize / 2}" r="${
      pfpSize / 2
    }" /></svg>`,
  );

  const response = await fetch(profilePicURL);
  const blob = await response.blob();
  const arrayBuffer = await blob.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const profileBuffer = await sharp(buffer)
  .resize(pfpSize, pfpSize)
  .composite([{ input: circleMask, blend: 'dest-in' }])
  .png()
  .toBuffer();
  
  const baseImageBuffer = await sharp(join(__dirname, '../public/images/battle-oracle-base.png'))
  .resize(600, 600)
  .png()
  .toBuffer();

  const pokemon1ImageBuffer = await sharp(join(__dirname, `../public/images/pokemons/${pokemonIds[0]}.png`))
  .resize(180, 180)
  .png()
  .toBuffer();

  const pokemon2ImageBuffer = await sharp(join(__dirname, `../public/images/pokemons/${pokemonIds[1]}.png`))
  .resize(200, 200)
  .png()
  .toBuffer();

  const pokemon3ImageBuffer = await sharp(join(__dirname, `../public/images/pokemons/${pokemonIds[2]}.png`))
  .resize(180, 180)
  .png()
  .toBuffer();
  
  ComponentsArray.push({input: Buffer.from(challengerName), top: 35, left: 20});
  ComponentsArray.push({input: profileBuffer, top: 97, left: 215});
  ComponentsArray.push({input: pokemon1ImageBuffer, top: 290, left: 70});
  ComponentsArray.push({input: pokemon2ImageBuffer, top: 290, left: 208});
  ComponentsArray.push({input: pokemon3ImageBuffer, top: 290, left: 377});
  const finalImage = await sharp(baseImageBuffer)
  .composite(ComponentsArray)
  .jpeg()
  .toBuffer();

  return finalImage;
  } catch(error) {
      console.error("Error during battle checkout generation:", error);
      throw error;
  }
}

export const generateTrending = async(trendingData: any) => {
  try {
    const ComponentsArray = [];

    const trendingUserData1 = await getFarcasterUserInfo(trendingData[0].fid); 
    const trendingUserData2 = await getFarcasterUserInfo(trendingData[1].fid); 
    const trendingUserData3 = await getFarcasterUserInfo(trendingData[2].fid); 

    const trendingHeader = `
      <svg width="600" height="50">
        <text x="150" y="40" font-size="36" fill="white">TRENDING USERS</text>
      </svg>
    `;
    
    const pfpSize = 150;
    const circleMask = Buffer.from(
      `<svg><circle cx="${pfpSize / 2}" cy="${pfpSize / 2}" r="${
        pfpSize / 2
      }" /></svg>`,
    );
    
    const baseImageBuffer = await sharp(join(__dirname, '../public/images/battle-scenes/0.png'))
    .resize(600, 600)
    .png()
    .toBuffer();
    
    // BRONCO CRAZYYY 😝😲😖🤯🤪🤪🤪🤪🤪💀
    // TOP 1
    const response1 = await fetch(trendingUserData1.pfp_url);
    const blob1 = await response1.blob();
    const arrayBuffer1 = await blob1.arrayBuffer();
    const buffer1 = Buffer.from(arrayBuffer1);
    const profileBuffer1 = await sharp(buffer1)
    .resize(pfpSize, pfpSize)
    .composite([{ input: circleMask, blend: 'dest-in' }])
    .png()
    .toBuffer();
    const username1 = `
      <svg width="600" height="50">
        <text x="0" y="40" font-size="36" fill="white">${trendingUserData1.userName} 🥇</text>
      </svg>
    `;
    const castsRepliesLikesRecasts1 = `
    <svg width="600" height="50">
    <text x="0" y="45" font-size="26" fill="white">🪄${trendingData[0].casts} 🗣️${trendingData[0].replies} 👍${trendingData[0].receivedLikes} 🔄️${trendingData[0].receivedRecasts}</text>
    </svg>
    `;
    const contribution1 = `
      <svg width="600" height="50">
        <text x="0" y="40" font-size="22" fill="white">NANOGRAPH metrics: ${trendingData[0].contribution}🔥</text>
      </svg>
    `;
    
    // TOP 2
    const response2 = await fetch(trendingUserData2.pfp_url);
    const blob2 = await response2.blob();
    const arrayBuffer2 = await blob2.arrayBuffer();
    const buffer2 = Buffer.from(arrayBuffer2);
    const profileBuffer2 = await sharp(buffer2)
    .resize(pfpSize, pfpSize)
    .composite([{ input: circleMask, blend: 'dest-in' }])
    .png()
    .toBuffer();
    const username2 = `
      <svg width="600" height="50">
        <text x="0" y="40" font-size="36" fill="white">${trendingUserData2.userName} 🥈</text>
      </svg>
    `;
    const castsRepliesLikesRecasts2 = `
    <svg width="600" height="50">
    <text x="0" y="45" font-size="26" fill="white">🪄${trendingData[1].casts} 🗣️${trendingData[1].replies} 👍${trendingData[1].receivedLikes} 🔄️${trendingData[1].receivedRecasts}</text>
    </svg>
    `;
    const contribution2 = `
      <svg width="600" height="50">
        <text x="0" y="40" font-size="22" fill="white">NANOGRAPH metrics: ${trendingData[1].contribution}🔥</text>
      </svg>
    `;
    
    // TOP 3
    const response3 = await fetch(trendingUserData3.pfp_url);
    const blob3 = await response3.blob();
    const arrayBuffer3 = await blob3.arrayBuffer();
    const buffer3 = Buffer.from(arrayBuffer3);
    const profileBuffer3 = await sharp(buffer3)
    .resize(pfpSize, pfpSize)
    .composite([{ input: circleMask, blend: 'dest-in' }])
    .png()
    .toBuffer();
    const username3 = `
      <svg width="600" height="50">
        <text x="0" y="40" font-size="36" fill="white">${trendingUserData3.userName} 🥉</text>
      </svg>
    `;
    const castsRepliesLikesRecasts3 = `
    <svg width="600" height="50">
    <text x="0" y="45" font-size="26" fill="white">🪄${trendingData[2].casts} 🗣️${trendingData[2].replies} 👍${trendingData[2].receivedLikes} 🔄️${trendingData[2].receivedRecasts}</text>
    </svg>
    `;
    const contribution3 = `
      <svg width="600" height="50">
        <text x="0" y="40" font-size="22" fill="white">NANOGRAPH metrics: ${trendingData[2].contribution}🔥</text>
      </svg>
    `;
    
    ComponentsArray.push({input: Buffer.from(trendingHeader), top: 30, left: 15});
    ComponentsArray.push({input: profileBuffer1, top: 80, left: 40});
    ComponentsArray.push({input: Buffer.from(username1), top: 80, left: 200});
    ComponentsArray.push({input: Buffer.from(castsRepliesLikesRecasts1), top: 120, left: 200});
    ComponentsArray.push({input: Buffer.from(contribution1), top: 160, left: 200});
    ComponentsArray.push({input: profileBuffer2, top: 250, left: 40});
    ComponentsArray.push({input: Buffer.from(username2), top: 250, left: 200});
    ComponentsArray.push({input: Buffer.from(castsRepliesLikesRecasts2), top: 290, left: 200});
    ComponentsArray.push({input: Buffer.from(contribution2), top: 330, left: 200});
    ComponentsArray.push({input: profileBuffer3, top: 420, left: 40});
    ComponentsArray.push({input: Buffer.from(username3), top: 420, left: 200});
    ComponentsArray.push({input: Buffer.from(castsRepliesLikesRecasts3), top: 460, left: 200});
    ComponentsArray.push({input: Buffer.from(contribution3), top: 500, left: 200});
    const finalImage = await sharp(baseImageBuffer)
    .composite(ComponentsArray)
    .jpeg()
    .toBuffer();

    return finalImage;
  } catch(error) {
    console.error("Error during trending generation:", error);
    throw error;
  }
}