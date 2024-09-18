import { serveStatic } from '@hono/node-server/serve-static';
import { Button, Frog, parseEther, TextInput } from 'frog';
import { getFarcasterUserInfo, postLum0xTestFrameValidation } from '../lib/lum0x.js';
import { publicClient } from '../lib/contracts.js';
import { devtools } from 'frog/dev';
import { handle } from 'frog/vercel';
import { serve } from '@hono/node-server';
import { assignPokemonToUser, createBattle, getBattleById, getBattlesByStatus, getPokemonName, getPokemonsByPlayerId, joinBattle, setSelectedPokemons, makeMove, forfeitBattle, getPokemonById, checkBattleCasual, welcomeGift } from '../lib/database.js';
import { SHARE_INTENT, SHARE_TEXT, SHARE_EMBEDS, FRAME_URL, SHARE_GACHA, title, CHAIN_ID, CONTRACT_ADDRESS, POKEMON_CONTRACT_ADDRESS, BATTLE_CONTRACT_ADDRESS } from '../config.js';
import { boundIndex } from '../lib/utils/boundIndex.js';
import { generateGame, generateFight, generateBattleConfirm, generateWaitingRoom, generatePokemonCard, generatePokemonMenu, generateBattleList, generateBattleListV0, generateLastTurnBattleLog, generateTrending, generateBattleReady } from '../image-generation/generators.js';
import { getPlayers, verifyMakerOrTaker } from '../lib/utils/battleUtils.js';
import { handleFrameLog } from '../lib/utils/handleFrameLog.js';
import { validateFramesPost } from '@xmtp/frames-validator';
import { Context, Next } from 'hono';
import { getPokemonTypeColor } from '../image-generation/pkmTypeColor.js';
import { fetchTopContributors } from '../lib/nanograph.js';
import path from 'path';

path.resolve(process.cwd(), 'fonts', 'fonts.conf')
path.resolve(process.cwd(), 'fonts', 'handjet.ttf')

type State = {
  verifiedAddresses?: `0x${string}`[];
  pfp_url: any;
  userName: any;
  selectedPokemons?: number[];
  lastSelectedPokemon?: number;
  currentTxId?: `0x${string}`;
  isMaker?: boolean;
  joinableBattleId?: number;
  isLoading?: boolean;
  hasMoved?: boolean;
  // isCasual?: boolean;
  isCompetitive?: boolean;
}

const addMetaTags = (client: string, version?: string) => {
  // Follow the OpenFrames meta tags spec
  return {
    unstable_metaTags: [
      { property: `of:accepts`, content: version || "vNext" },
      { property: `of:accepts:${client}`, content: version || "vNext" },
    ],
  };
};

const xmtpSupport = async (c: Context, next: Next) => {
  // Check if the request is a POST and relevant for XMTP processing
  if (c.req.method === "POST") {
    const requestBody = (await c.req.json().catch(() => { })) || {};
    if (requestBody?.clientProtocol?.includes("xmtp")) {
      c.set("client", "xmtp");
      const { verifiedWalletAddress } = await validateFramesPost(requestBody);
      c.set("verifiedWalletAddress", verifiedWalletAddress);
    } else {
      // Add farcaster check
      c.set("client", "farcaster");
    }
  }
  await next();
};

export const app = new Frog<{ State: State }>({
  title,
  assetsPath: '/',
  basePath: '/api',
  initialState: {
    verifiedAddresses: [],
    pfp_url: '',
    userName: '',
  },
  ...addMetaTags("xmtp"),
})

app.use(xmtpSupport);

app.use('/*', serveStatic({ root: './public' }))

app.frame('/', (c) => {
  return c.res({
    title,
    image: '/images/start.png',
    imageAspectRatio: '1:1',
    intents: [
      <Button action={`/verify`}>PLAY 🔴</Button>,
    ],
  })
})

app.frame('/verify', async (c) => {
  const fid = c.frameData?.fid;
  await postLum0xTestFrameValidation(Number(fid), "verify");
  if (fid) {
    const { verifiedAddresses } = await getFarcasterUserInfo(fid);
    if (!verifiedAddresses || verifiedAddresses.length === 0) {
      return c.res({
        title,
        image: 'https://i.imgur.com/2tRZhkQ.jpeg',
        imageAspectRatio: '1:1',
        intents: [
          <Button action={`https://verify.warpcast.com/verify/${fid}`}>VERIFY WALLET</Button>,
          <Button.Reset>RESET</Button.Reset>,
        ],
      });
    }
    await welcomeGift(Number(fid), verifiedAddresses[0]);
    c.deriveState((prevState: any) => {
      prevState.verifiedAddresses = verifiedAddresses;
    });
  }
  return c.res({
    title,
    image: '/images/welcome.png',
    imageAspectRatio: '1:1',
    intents: [
      <Button action={`/battle`}>BATTLE ⚔️</Button>,
      <Button action={`/pokedex/0`}>POKEDEX 📱</Button>,
      <Button action={`/trending`}>NANOGRAPH🔥</Button> //trending players
    ],
  })
})

app.frame('/battle', async (c) => {
  // const { frameData } = c;
  // const fid = frameData?.fid;
  // const { verifiedAddresses } = c.previousState ? c.previousState : await getFarcasterUserInfo(fid);
  // const playerAddress = verifiedAddresses[0] as `0x${string}`;

  // set isMaker to true
  c.deriveState((prevState: any) => {
    prevState.isMaker = true;
    prevState.selectedPokemons = [];
  });

  return c.res({
    title,
    image: '/images/battle3.png',
    imageAspectRatio: '1:1',
    intents: [
      // <Button action={`/find-battle`}>TEST LIST</Button>,
      <Button action={`/battle-create`}>CREATE NEW BATTLE</Button>,
      <Button action={`/battle-join/list/0`}>JOIN BATTLE</Button>,
      <Button action={`/verify`}>↩️</Button>,
    ],
  })
})

app.frame('/battle-create', async (c) => {
  // const { frameData } = c;
  // const fid = frameData?.fid;
  // const { verifiedAddresses } = c.previousState ? c.previousState : await getFarcasterUserInfo(fid);
  // const playerAddress = verifiedAddresses[0] as `0x${string}`;

  // set isMaker to true
  c.deriveState((prevState: any) => {
    prevState.isMaker = true;
    prevState.selectedPokemons = [];
  });

  return c.res({
    title,
    image: '/images/battle3.png',
    imageAspectRatio: '1:1',
    intents: [
      <Button value='casual' action={`/pokemons/0/0`}>CASUAL</Button>,
      <Button value='competitive' action={`/pokemons/0/0`}>COMPETITIVE</Button>,
      <Button action={`/verify`}>↩️</Button>,
    ],
  })
})

app.frame("/battle-join/list/:position", async (c) => {
  // const waitingBattles = await getOpenBattles();
  const waitingBattles = await getBattlesByStatus('waiting');

  //TODO: If there are no waiting battles, show a message
  const totalBattles = waitingBattles.length;

  const position = Number(c.req.param('position'));
  const battle = waitingBattles[position];
  console.log(battle);
  const battlePokemons = JSON.parse(waitingBattles[position].maker_pokemons).map((pokemon: any) => pokemon.id);
  // const battlePokemons = waitingBattles[position].maker_pokemons.map((pokemon: any) => pokemon.id);
  // const battle = await getBattleById(waitingBattles[position]);
  // const battlePokemons = battle.maker_pokemons.map((pokemon: any) => pokemon.id);

  const getNextIndex = (currentIndex: any) => (currentIndex + 1) % totalBattles;
  const getPreviousIndex = (currentIndex: any) => (currentIndex - 1 + totalBattles) % totalBattles;

  const nextBattleId = getNextIndex(position);
  const previousBattleId = getPreviousIndex(position);

  return c.res({
    title,
    image: `/image/battlelist/${battlePokemons[0]}/${battlePokemons[1]}/${battlePokemons[2]}/${battle.maker}`,
    imageAspectRatio: '1:1',
    intents: [
      <Button action={`/battle-join/list/${previousBattleId}`}>⬅️</Button>,
      <Button action={`/battle/share/${waitingBattles[position].id}`}>BATTLE⚔️</Button>,
      <Button action={`/battle-join/list/${nextBattleId}`}>➡️</Button>,
      <Button action={`/battle`}>↩️</Button>,
    ],
  });
});

app.frame('/pokemons/:position/:index', async (c) => {
  const { frameData, buttonValue } = c;
  const fid = frameData?.fid;
  let position = Number(c.req.param('position'));
  // let isCasual = c.previousState?.isCasual;
  let isCompetitive = c.previousState?.isCompetitive;
  const index = Number(c.req.param('index'));
  await postLum0xTestFrameValidation(Number(fid), `pokemons/${position}/${index}`);

  if (Number(buttonValue)) {
    c.deriveState((prevState: any) => {
      prevState.joinableBattleId = Number(buttonValue);
      prevState.isMaker = false;
    });
  }

  // if(buttonValue === 'casual') {
  //   c.deriveState((prevState: any) => {
  //     prevState.isCasual = true;
  //   });
  // }

  if(buttonValue === 'competitive') {
    c.deriveState((prevState: any) => {
      prevState.isCompetitive = true;
    });
  }else if(buttonValue === 'casual'){
    c.deriveState((prevState: any) => {
      prevState.isCompetitive = false;
    });
  }

  const selectedPokemons = c.previousState?.selectedPokemons || [];
  const playerPokemons = await getPokemonsByPlayerId(fid!, selectedPokemons);

  if (buttonValue === 'confirm') {
    const isMaker = c.previousState?.isMaker!;
    const joinableBattleId = c.previousState?.joinableBattleId!;
    const lastSelectedPokemon = c.previousState?.lastSelectedPokemon!;
    const pokemonId = playerPokemons[lastSelectedPokemon];

    if(!isMaker) {
      isCompetitive = !await checkBattleCasual(joinableBattleId);
      // if(!isCasual) {
      //   isCompetitive = true;
      // }
    }

    selectedPokemons.push(pokemonId);

    c.deriveState((prevState: any) => {
      prevState.selectedPokemons = selectedPokemons;
    });

    if (index == 3) {
      if(isCompetitive) {
        return c.res({
          title,
          image: `/image/checkout/${selectedPokemons[0]}/${selectedPokemons[1]}/${selectedPokemons[2]}`,
          imageAspectRatio: '1:1',
          intents: [
            <Button.Transaction action={`${isMaker ? '/battle/handle' : `/battle/${joinableBattleId}/join`}`} target={`${isMaker ? '/create-battle' : '/join-battle'}`}>{isMaker ? 'CREATE BATTLE' : 'JOIN BATTLE'}</Button.Transaction>,
            <Button action={`/battle`}>↩️</Button>,
          ],
        })
      } else {
        return c.res({
          title,
          image: `/image/checkout/${selectedPokemons[0]}/${selectedPokemons[1]}/${selectedPokemons[2]}`,
          imageAspectRatio: '1:1',
          intents: [
            <Button value={`${isMaker ? '' : joinableBattleId}`} action={`${isMaker ? '/finish-battle-create' : `/finish-battle-join`}`}>{isMaker ? 'CREATE BATTLE' : 'JOIN BATTLE'}</Button>,
            <Button action={`/battle`}>↩️</Button>,
          ],
        })
      }
    }

    // remove selected pokemon from player pokemons
    playerPokemons.splice(lastSelectedPokemon, 1);
  }

  const pokemonId = playerPokemons[position];

  // TODO: check if user has 3 or more pokemons
  // console.log(playerPokemons)
  // console.log(pokemonId)

  const totalPlayerPokemons = playerPokemons.length;
  const pokemon = await getPokemonById(pokemonId);
  const pokemonType = pokemon.type[0];
  const hp = pokemon.hp;
  const atk = pokemon.attack;
  const def = pokemon.defense;
  const spd = pokemon.speed;
  const pokemonName = await getPokemonName(pokemonId);
  c.deriveState((prevState: any) => {
    prevState.lastSelectedPokemon = position;
  });

  return c.res({
    title,
    image: `/image/pokemon/${pokemonId}/${pokemonName}/${pokemonType}/${hp}/${atk}/${def}/${spd}`,
    imageAspectRatio: '1:1',
    intents: [
      <Button action={`/pokemons/${boundIndex(position - 1, totalPlayerPokemons)}/${index}`}>⬅️</Button>,
      <Button action={`/pokemons/${boundIndex(position + 1, totalPlayerPokemons)}/${index}`}>➡️</Button>,
      <Button value='confirm' action={`/pokemons/0/${index + 1}`}>✅</Button>,
      <Button action={`/battle`}>↩️</Button>,
    ],
  })
})

app.frame('/battle/handle', async (c) => {
  const txId = c.transactionId ? c.transactionId : '0x';
  let currentTx: `0x${string}` = '0x';

  if (txId !== '0x') {
    c.deriveState((prevState: any) => {
      prevState.currentTxId = txId;
      currentTx = txId;
    })
  } else {
    currentTx = c.previousState?.currentTxId!;
  }

  if (currentTx !== '0x') {
    try {
      const transactionReceipt = await publicClient.getTransactionReceipt({ hash: currentTx });

      console.log(transactionReceipt);

      if (transactionReceipt && transactionReceipt.status == 'reverted') {
        return c.error({ message: 'Transaction failed' });
      }

      if (!c.previousState?.selectedPokemons) {
        return c.error({ message: 'No pokemons selected' });
      }

      if (c.previousState?.selectedPokemons.length < 3) {
        return c.error({ message: 'Not enough pokemons selected' });
      }

      if (transactionReceipt?.status === 'success') {
        return c.res({
          title,
          image: `/images/go!.png`,
          imageAspectRatio: '1:1',
          intents: [
            <Button action={`/finish-battle-create`}>BATTLE! 🔥</Button>,
          ],
        })
      }
    } catch (error) {
      console.log(error)
    }
  }

  return c.res({
    title,
    image: `/images/loading.gif`,
    imageAspectRatio: '1:1',
    intents: [
      <Button action={`/battle/handle`}>REFRESH 🔄️</Button>,
    ],
  })
})

app.frame('/finish-battle-create', async (c) => {
  const { frameData } = c;
  const fid = frameData?.fid;

  let isCompetitive = c.previousState?.isCompetitive;

  if(!isCompetitive) {
    isCompetitive = false;
  }

  await postLum0xTestFrameValidation(Number(fid), "finish-battle-create");
  const newBattleId = await createBattle(fid!, c.previousState.selectedPokemons!, isCompetitive);

  if (newBattleId === 'Already creating battle') {
    return c.res({
      title,
      image: '/images/loading.gif',
      imageAspectRatio: '1:1',
      intents: [
        <Button action={`/finish-battle-create`}>WAIT...</Button>,
      ],
    })
  }

  if (newBattleId === 'Failed to create battle') {
    return c.error({ message: 'Failed to create battle' });
  }

  c.deriveState((prevState: any) => {
    prevState.newBattleId = newBattleId;
  });

  return c.res({
    title,
    image: `/images/shareBattle.png`, //TODO: change image TO SHOW BATTLE ID
    imageAspectRatio: '1:1',
    intents: [
      <Button.Link href={`${SHARE_INTENT}/${SHARE_TEXT}/${SHARE_EMBEDS}/${FRAME_URL}/battle/share/${newBattleId}`}>SHARE ID:{newBattleId}</Button.Link>,
      <Button action={`/battle/${newBattleId}`}>BATTLE⚔️</Button>,
    ],
  })
})

// TODO: finish this later
app.frame('/find-battle', async (c) => {
  const battles = await getBattlesByStatus('waiting');

  if (battles.length === 0) {
    return c.res({
      title,
      image: '/images/waiting-for-battle.png', //change image to show no battles
      imageAspectRatio: '1:1',
      intents: [
        <Button action={`/find-battle`}>REFRESH 🔄️</Button>,
      ]
    });
  }

  c.deriveState((prevState: any) => {
    // prevState.joinableBattleId = battleId;
    prevState.isMaker = false;
  });

  return c.res({
    title,
    image: '/image/find-battle-list',
    imageAspectRatio: '1:1',
    intents: [
      <TextInput placeholder='Battle ID' />,
      <Button action={`/pokemons/0/0`}>JOIN BATTLE</Button>,
      <Button action={`/battle`}>↩️</Button>,
    ]
  });
})

app.frame('/battle/:gameId/join', async (c) => {
  const gameId = Number(c.req.param('gameId'));
  const txId = c.transactionId ? c.transactionId : '0x';
  let currentTx: `0x${string}` = '0x';

  if (txId !== '0x') {
    c.deriveState((prevState: any) => {
      prevState.currentTxId = txId;
      currentTx = txId;
    })
  } else {
    currentTx = c.previousState?.currentTxId!;
  }

  if (currentTx !== '0x') {
    try {
      const transactionReceipt = await publicClient.getTransactionReceipt({ hash: currentTx });

      console.log(transactionReceipt);

      if (transactionReceipt && transactionReceipt.status == 'reverted') {
        return c.error({ message: 'Transaction failed' });
      }

      if (!c.previousState?.selectedPokemons) {
        return c.error({ message: 'No pokemons selected' });
      }

      if (c.previousState?.selectedPokemons.length < 3) {
        return c.error({ message: 'Not enough pokemons selected' });
      }

      if (transactionReceipt?.status === 'success') {
        return c.res({
          title,
          image: `/image/battleready/${gameId}.png`,
          imageAspectRatio: '1:1',
          intents: [
            <Button value={gameId.toString()} action={`/finish-battle-join`}>Battle! 🔥</Button>,
          ],
        })
      }
    } catch (error) {
      console.log(error)
    }
  }

  return c.res({
    title,
    image: `/images/transaction-loading.png`,
    imageAspectRatio: '1:1',
    intents: [
      <Button action={`/battle/${gameId}/join`}>REFRESH 🔄️</Button>,
    ],
  })
})

app.frame('/finish-battle-join', async (c) => {
  const { frameData, buttonValue } = c;
  const fid = frameData?.fid;
  await postLum0xTestFrameValidation(Number(fid), "finish-battle-join");
  const gameId = Number(buttonValue);

  const message = await joinBattle(gameId, fid!, c.previousState.selectedPokemons!);
  await setSelectedPokemons(gameId, fid!, [0, 1]);

  if (message === 'Already joining battle') {
    return c.res({
      title,
      image: '/images/loading.gif',
      imageAspectRatio: '1:1',
      intents: [
        <Button action={`/finish-battle-join`}>WAIT...</Button>,
      ],
    })
  }

  if (message === 'Failed to join battle') {
    return c.error({ message: 'Failed to join battle' });
  }

  return c.res({
    title,
    image: `/image/battleready/${gameId}.png`,
    imageAspectRatio: '1:1',
    intents: [
      <Button action={`/battle/${gameId}`}>BATTLE⚔️</Button>,
    ],
  })
})

//render pokemon active pokemons and basic stats (hp) 
app.frame('/battle/:gameId', async (c) => {
  const gameId = Number(c.req.param('gameId'));
  const fid = c.frameData?.fid;
  await postLum0xTestFrameValidation(Number(fid), `battle/${gameId}`);
  if (fid) {
    const { verifiedAddresses } = await getFarcasterUserInfo(fid);
    if (!verifiedAddresses || verifiedAddresses.length === 0) {
      return c.res({
        title,
        image: 'https://i.imgur.com/2tRZhkQ.jpeg',
        imageAspectRatio: '1:1',
        intents: [
          <Button action={`https://verify.warpcast.com/verify/${fid}`}>VERIFY WALLET</Button>,
          <Button.Reset>RESET</Button.Reset>,
        ],
      });
    }
    c.deriveState((prevState: any) => {
      prevState.verifiedAddresses = verifiedAddresses;
    });
  }

  const battle = await getBattleById(gameId);

  // console.log(battle);

  const battleStatus = battle.status;

  if (battleStatus === "waiting") {
    return c.res({
      title,
      image: `/images/waiting-for-p2.png`,
      imageAspectRatio: '1:1',
      intents: [
        <Button action={`/battle/${gameId}`}>RELOAD 🔄️</Button>,
      ]
    });
  }

  c.deriveState((prevState: any) => {
    prevState.hasMoved = false;
  });

  return c.res({
    title,
    image: `/image/vs/${gameId}/user/${fid}`,
    imageAspectRatio: '1.91:1',
    intents: [
      <Button action={`/battle/${gameId}/fight`}>FIGHT⚔️</Button>,
      <Button action={`/battle/${gameId}/pokemon`}>POKEMON</Button>,
      <Button action={`/battle/${gameId}/battlelog`}>LOG📜</Button>,
      <Button action={`/battle/${gameId}/run`}>RUN🏳️</Button>
    ]
  })
});

app.frame('/battle/share/:gameId', async (c) => {
  const gameId = c.req.param('gameId');

  return c.res({
    title,
    image: '/images/p2-pokemons.png',
    imageAspectRatio: '1:1',
    intents: [
      <Button value={gameId} action='/pokemons/0/0'>POKEMONS 📱</Button>,
    ]
  })
});

app.frame('/battle/:gameId/checkout', async (c) => {
  const { frameData } = c;
  const fid = frameData?.fid;
  const gameId = Number(c.req.param('gameId'));
  await postLum0xTestFrameValidation(Number(fid), `battle/${gameId}/checkout`);
  const battle: any = await getBattleById(gameId);

  const role = verifyMakerOrTaker(fid!, battle);
  console.log(role);
  const winner = battle.battle_log[battle.battle_log.length - 1].split(' ')[0];

  if (winner === role) {
    return c.res({
      title,
      image: '/images/winner.png',
      imageAspectRatio: '1:1',
      intents: [
        <Button action='/'>PLAY AGAIN 🔄️</Button>,
      ]
    })
  } else {
    return c.res({
      title,
      image: '/images/loser.png',
      imageAspectRatio: '1:1',
      intents: [
        <Button action='/'>PLAY AGAIN 🔄️</Button>,
      ]
    })
  }
});

app.frame('/battle/:gameId/fight', async (c) => {
  const gameId = c.req.param('gameId') as string;
  const { frameData } = c;
  const fid = frameData?.fid;
  await postLum0xTestFrameValidation(Number(fid), `battle/${gameId}/fight`);
  // TODO: a function to update the battle log and status
  return c.res({
    title,
    image: `/image/fight/${gameId}/user/${fid}`,
    imageAspectRatio: '1:1',
    intents: [
      <Button value='1' action={`/battle/${gameId}/confirm`}>1</Button>,
      <Button value='2' action={`/battle/${gameId}/confirm`}>2</Button>,
      <Button value='3' action={`/battle/${gameId}/confirm`}>3</Button>,
      <Button action={`/battle/${gameId}`}>↩️</Button>
    ]
  })
});

app.frame('/battle/:gameId/confirm', async (c) => {
  const { buttonValue } = c;
  const gameId = c.req.param('gameId') as string;

  return c.res({
    title,
    image: '/images/confirm-move.png',
    imageAspectRatio: '1:1',
    intents: [
      <Button action={`/battle/${gameId}/waiting/${buttonValue}`}>YES</Button>,
      <Button action={`/battle/${gameId}/fight`}>↩NO</Button>
    ]
  })
});

app.frame('/battle/:gameId/waiting/:value', async (c) => {
  const { frameData } = c;
  const gameId = Number(c.req.param('gameId'));
  const value = Number(c.req.param('value'));
  const fid = frameData?.fid;
  await postLum0xTestFrameValidation(Number(fid), `battle/${gameId}/waiting/${value}`);
  const hasMoved = c.previousState?.hasMoved;


  if (!hasMoved) {
    const battle: any = await getBattleById(gameId)
    const { player } = getPlayers(fid!, battle);

    await makeMove(gameId, fid!, value ? player.currentPokemon.moves[value - 1]:0);

    c.deriveState((prevState: any) => {
      prevState.hasMoved = true;
    });
  }

  const updatedBattle = await getBattleById(gameId);

  if (updatedBattle.status === 'ended') {
    return c.res({
      title,
      image: '/images/winner.png',
      imageAspectRatio: '1:1',
      intents: [
        <Button action={`/battle/${gameId}/checkout`}>PLAY AGAIN 🔄️</Button>,
      ]
    })
  }

  if (updatedBattle.maker_move == null && updatedBattle.taker_move == null) {
    return c.res({
      title,
      image: '/images/waiting-for-p2.png',
      imageAspectRatio: '1:1',
      intents: [
        <Button action={`/battle/${gameId}`}>🔄️</Button>,
      ]
    })
  } else {
    return c.res({
      title,
      image: '/images/waiting-for-p2.png',
      imageAspectRatio: '1:1',
      intents: [
        <Button action={`/battle/${gameId}/waiting/${value}`}>🔄️</Button>,
      ]
    })
  }
});

app.frame('/battle/:gameId/pokemon', async (c) => {
  const { frameData } = c;
  const fid = frameData?.fid;
  const gameId = c.req.param('gameId') as string;
  await postLum0xTestFrameValidation(Number(fid), `battle/${gameId}/pokemon`);

  const battle: any = await getBattleById(Number(gameId));
  const { player, opponent } = getPlayers(fid!, battle);

  const activePokemon = player.battling_pokemons;

  return c.res({
    title,
    image: `/image/pokemenu/${gameId}/user/${fid}`,
    imageAspectRatio: '1:1',
    intents: [
      ...(activePokemon.length > 1
        ? [<Button value='0' action={`/battle/${gameId}/confirm`}>SWAP🔄️</Button>]
        : []),
      <Button action={`/battle/${gameId}/pokemon/${opponent.id}`}>ENEMY🔎</Button>,
      <Button action={`/battle/${gameId}`}>↩️</Button>
    ]
  })
});

// fully implement enemy scout screen
app.frame('/battle/:gameId/pokemon/:enemyFid', async (c) => {
  const gameId = c.req.param('gameId') as string;
  const enemyFid = c.req.param('enemyFid') as string;

  return c.res({
    title,
    image: `/image/pokemenu/${gameId}/user/${enemyFid}`,
    imageAspectRatio: '1:1',
    intents: [
      <Button action={`/battle/${gameId}/pokemon`}>↩️</Button>
    ]
  })
});

// TODO implement battle log (IMAGE GENERATION)
app.frame('/battle/:gameId/battlelog', async (c) => {
  const gameId = c.req.param('gameId') as string;

  return c.res({
    title,
    image: `/image/last-turn-log/${gameId}`,
    imageAspectRatio: '1:1',
    intents: [
      <Button action={`/battle/${gameId}`}>↩️</Button>
    ]
  })
});

app.frame('/battle/:gameId/run', async (c) => {
  const gameId = c.req.param('gameId') as string;
  //TODO Backend function to set a winner and end the battle 
  return c.res({
    title,
    image: '/images/RUN.png',
    imageAspectRatio: '1:1',
    intents: [
      <Button action={`/battle/${gameId}`}>NO</Button>,
      <Button action={`/battle/${gameId}/forfeit`}>YES</Button>,
    ]
  })
});

app.frame('/battle/:gameId/forfeit', async (c) => {
  const gameId = c.req.param('gameId') as any;
  const { frameData } = c;
  const fid = frameData?.fid;
  await postLum0xTestFrameValidation(Number(fid), `battle/${gameId}/forfeit`);
  await forfeitBattle(gameId, fid!);

  return c.res({
    title,
    image: '/images/loser.png',
    imageAspectRatio: '1:1',
    intents: [
      <Button.Reset>PLAY AGAIN 🔄️</Button.Reset>,
    ]
  })
});

app.frame('/pokedex/:position', async (c) => {
  const { frameData } = c;
  const fid = frameData?.fid;
  const position = Number(c.req.param('position')) || 0;
  await postLum0xTestFrameValidation(Number(fid), `pokedex/${position}`);
  const playerPokemons = await getPokemonsByPlayerId(fid!);
  const totalPlayerPokemons = playerPokemons.length;


  const pokemonId = playerPokemons[position];
  const pokemonName = await getPokemonName(Number(pokemonId));
  const pokemon = await getPokemonById(pokemonId);
  console.log(pokemon);
  const pokemonType = pokemon.type[0];
  const hp = pokemon.hp;
  const atk = pokemon.attack;
  const def = pokemon.defense;
  const spd = pokemon.speed;
  // const image = await getPokemonImage(pokemonId);

  return c.res({
    title,
    image: `/image/pokemon/${pokemonId}/${pokemonName}/${pokemonType}/${hp}/${atk}/${def}/${spd}`,
    imageAspectRatio: '1:1',
    intents: [
      <Button action={`/pokedex/${boundIndex(position - 1, totalPlayerPokemons)}`}>⬅️</Button>,
      <Button action={`/pokedex/${boundIndex(position + 1, totalPlayerPokemons)}`}>➡️</Button>,
      <Button action={`/new`}>NEW 🍀</Button>,
      <Button action={`/verify`}>↩️</Button>,
    ],
  })
})

app.frame('/new', (c) => {
  return c.res({
    title,
    image: '/images/gacha1.png',
    imageAspectRatio: '1:1',
    intents: [
      <Button.Transaction action={`/loading`} target={`/send`}>CAPTURE 🕹️</Button.Transaction>,
      <Button action={`/pokedex/0`}>↩️</Button>,
    ],
  })
})

app.frame('/loading', async (c) => {
  const txId = c.transactionId ? c.transactionId : '0x';
  let currentTx: `0x${string}` = '0x';

  if (txId !== '0x') {
    c.deriveState((prevState: any) => {
      prevState.currentTxId = txId;
      currentTx = txId;
    })
  } else {
    currentTx = c.previousState?.currentTxId!;
  }

  if (currentTx !== '0x') {
    try {
      const transactionReceipt = await publicClient.getTransactionReceipt({
        hash: currentTx,
      });

      // console.log(transactionReceipt);

      // console.log("topics", transactionReceipt?.logs[1].topics);

      if (transactionReceipt && transactionReceipt.status == 'reverted') {
        return c.error({ message: 'Transaction failed' });
      }

      if (transactionReceipt?.status === 'success') {
        /* const pokemonId = c.previousState.mintedPokemonId ? c.previousState.mintedPokemonId : await assignPokemonToUser(fid!, currentTx as `0x${string}`);

        c.deriveState((prevState: any) => {
          prevState.mintedPokemonId = pokemonId;
        }); */

        return c.res({
          title,
          image: `/images/catch.png`,
          imageAspectRatio: '1:1',
          intents: [
            <Button action={`/finish-mint`}>CATCH</Button>,
          ],
        })
      }
    } catch (error) {
      console.log("Waiting for tx...");
      console.log(error);
    }
  }
  return c.res({
    title,
    image: `/images/transaction-loading.png`,
    imageAspectRatio: '1:1',
    intents: [
      <Button action={`/loading`}>REFRESH 🔄️</Button>,
    ],
  })
})

app.frame('/finish-mint', async (c) => {
  const { frameData } = c;
  const fid = frameData?.fid;
  await postLum0xTestFrameValidation(Number(fid), "finish-mint");
  const currentTx = c.previousState?.currentTxId!;

  console.log(currentTx);

  const pokemonId = await assignPokemonToUser(fid!, currentTx as `0x${string}`);

  if (pokemonId == 0) {
    return c.res({
      title,
      image: '/images/transaction-loading.png',
      imageAspectRatio: '1:1',
      intents: [
        <Button action={`/finish-mint`}>REFRESH 🔄️</Button>,
      ],
    })
  }

  c.deriveState((prevState: any) => {
    prevState.mintedPokemonId = pokemonId;
  });

  return c.res({
    title,
    image: `/images/checkout-mint.png`,
    imageAspectRatio: '1:1',
    intents: [
      <Button action={`/gotcha/${pokemonId}`}>CHECK IT OUT!!</Button>,
    ],
  })
})

app.frame('/trending', async (c) => {
  return c.res({
    title,
    image: '/image/trending',
    imageAspectRatio: '1:1',
    intents: [
      <Button action={`/verify`}>↩️</Button>,
    ],
  })
})

app.transaction('/mint', (c) => {

  const abi = [
    {
      "type": "function",
      "name": "requestPokemon",
      "inputs": [],
      "outputs": [
          {
              "name": "requestId",
              "type": "uint256",
              "internalType": "uint256"
          }
      ],
      "stateMutability": "nonpayable"
  }
  ];

  return c.contract({
    abi,
    functionName: 'requestPokemon',
    args: [],
    chainId: CHAIN_ID,
    to: POKEMON_CONTRACT_ADDRESS,
    value: parseEther("0")
  });

  // const mintCost = '0.000777';
  // return c.send({
  //   chainId: CHAIN_ID,
  //   to: CONTRACT_ADDRESS,
  //   value: parseEther(mintCost as string),
  // })
})

app.transaction('/send', (c) => {
  const mintCost = '0.000777';
  return c.send({
    chainId: CHAIN_ID,
    to: CONTRACT_ADDRESS,
    value: parseEther(mintCost as string),
  })
})

app.transaction('/create-battle', (c) => {

  const abi = [{
    "type": "function",
    "name": "createBattle",
    "inputs": [
        {
            "name": "_amountToBet",
            "type": "uint256",
            "internalType": "uint256"
        },
        {
            "name": "_pokemons",
            "type": "uint256[]",
            "internalType": "uint256[]"
        }
    ],
    "outputs": [
        {
            "name": "",
            "type": "uint256",
            "internalType": "uint256"
        }
    ],
    "stateMutability": "nonpayable"
  }];

  console.log("state", c.previousState.selectedPokemons);

  return c.contract({
    abi,
    functionName: 'createBattle',
    args: [5n, [1n, 2n, 3n]],
    chainId: CHAIN_ID,
    to: BATTLE_CONTRACT_ADDRESS
  });




  // const cost = '0.000777';
  // return c.send({
  //   chainId: CHAIN_ID,
  //   to: CONTRACT_ADDRESS,
  //   value: parseEther(cost as string),
  // })
})

app.transaction('/join-battle', (c) => {
  const cost = '0.000777';
  return c.send({
    chainId: CHAIN_ID,
    to: CONTRACT_ADDRESS,
    value: parseEther(cost as string),
  })
})

app.frame('/gotcha/:pokemonId', async (c) => {
  let pokemonId = Number(c.req.param('pokemonId'));
  if (!pokemonId) {
    console.log("Failed getting pokemon... trying to get the last pokemon");
    const playerPokemons = await getPokemonsByPlayerId(c.frameData?.fid!);
    pokemonId = playerPokemons[playerPokemons.length - 1];
  }
  const pokemonName = await getPokemonName(pokemonId);
  const pokemon = await getPokemonById(pokemonId);
  const pokemonType = pokemon.type[0];
  const hp = pokemon.hp;
  const atk = pokemon.attack;
  const def = pokemon.defense;
  const spd = pokemon.speed;
  return c.res({
    title,
    image: `/image/pokemon/${pokemonId}/${pokemonName}/${pokemonType}/${hp}/${atk}/${def}/${spd}`,
    imageAspectRatio: '1:1',
    intents: [
      <Button.Link href={`${SHARE_INTENT}${SHARE_GACHA}${SHARE_EMBEDS}${FRAME_URL}/share/${pokemonId}`}>SHARE</Button.Link>,
      <Button action={`/`}>HOME 🏠</Button>,
    ],
  })
})

app.frame('/share/:pokemonId', (c) => {
  const pokemonId = c.req.param('pokemonId');
  return c.res({
    title,
    image: `/images/${pokemonId}.png`,
    imageAspectRatio: '1:1',
    intents: [
      <Button action={`/`}>TRY IT OUT 🏠</Button>,
    ],
  })
})

app.frame('/test', (c) => {
  return c.res({
    title,
    image: `/image/vs/test`,
    imageAspectRatio: '1.91:1',
    intents: [
      <Button action={`/`}>TRY IT OUT 🏠</Button>,
    ],
  })
})

app.hono.get('/image/vs/test', async (c) => {
  try {
    const image = await generateGame(
      'charizard',
      25,
      'pikachu',
      6,
      70,
      70,
      60,
      60,
      1,
    );

    return c.newResponse(image, 200, {
      'Content-Type': 'image/png',
      'Cache-Control': 'max-age=0', //try no-cache later
    });
  } catch (error) {
    console.error("Error generating image:", error);
    return c.newResponse("Error generating image", 500);
  }
});

app.hono.get('/image/find-battle-list', async (c) => {
  const battles = await getBattlesByStatus('waiting');
  if (battles.length === 0) {
    return c.newResponse("No battles found", 404);
  }
  
  try {
    const image = await generateBattleListV0(battles as any);
    return c.newResponse(image, 200, {
      'Content-Type': 'image/png',
      'Cache-Control': 'max-age=0', //try no-cache later
    });
  } catch (error) {
    console.error("Error generating image:", error);
    return c.newResponse("Error generating image", 500);
  }
});

app.hono.get('/image/last-turn-log/:gameId', async (c) => {
  const gameId = c.req.param('gameId') as string;
  const battle: any = await getBattleById(Number(gameId));
  const battleLog = battle.battle_log;

  try {
    const image = await generateLastTurnBattleLog(handleFrameLog(battleLog, battle.current_turn));
    return c.newResponse(image, 200, {
      'Content-Type': 'image/png',
      'Cache-Control': 'max-age=0', //try no-cache later
    });
  } catch (error) {
    console.error("Error generating image:", error);
    return c.newResponse("Error generating image", 500);
  }
});

app.hono.get('/image/vs/:gameId/user/:userFid', async (c) => {
  const battle: any = await getBattleById(Number(c.req.param('gameId')));

  const { player, opponent } = getPlayers(Number(c.req.param('userFid')), battle);
  // console.log(player)
  const id = (Number(c.req.param('gameId')) % 6) + 1;
  try {
    const image = await generateGame(
      player.currentPokemon.name.toString(),
      player.currentPokemon.id,
      opponent.currentPokemon.name.toLowerCase(),
      opponent.currentPokemon.id,
      player.currentPokemon.hp,
      player.currentPokemon.status.currentHP,
      opponent.currentPokemon.hp,
      opponent.currentPokemon.status.currentHP,
      id,
    );

    return c.newResponse(image, 200, {
      'Content-Type': 'image/png',
      'Cache-Control': 'max-age=0', //try no-cache later
    });
  } catch (error) {
    console.error("Error generating image:", error);
    return c.newResponse("Error generating image", 500);
  }
});

app.hono.get('/image/battleready/:gameId', async (c) => {
  try {
    const battle: any = await getBattleById(Number(c.req.param('gameId')));
    const makerPokemons = battle.maker_pokemons;
    const takerPokemons = battle.taker_pokemons;
    // console.log(attacks);
    // review logic when theres only one battling pokemon left
    const image = await generateBattleReady(
      makerPokemons,
      takerPokemons
    );

    return c.newResponse(image, 200, {
      'Content-Type': 'image/png',
      'Cache-Control': 'max-age=0', //try no-cache later
    });
  } catch (error) {
    console.error("Error generating image:", error);
    return c.newResponse("Error generating image", 500);
  }
})

app.hono.get('/image/pokemenu/:gameId/user/:userFid', async (c) => {
  try {
    const userFid = Number(c.req.param('userFid'));
    const battle: any = await getBattleById(Number(c.req.param('gameId')));
    const { player } = getPlayers(userFid, battle)

    const currentPokemon = player.currentPokemon;

    console.log(currentPokemon.moveDetails);

    let attacks: any = [];

    currentPokemon.moveDetails.forEach((move: any) => {
      attacks.push({ atk: move.name, type: { name: move.type, color: getPokemonTypeColor(move.type) } });
    })

    // console.log(attacks);
    // review logic when theres only one battling pokemon left
    const image = await generatePokemonMenu(
      player.currentPokemon.name,
      player.currentPokemon.id,
      player.secondaryPokemon.name,
      player.secondaryPokemon.id,
      player.currentPokemon.hp,
      player.currentPokemon.status.currentHP,
      player.secondaryPokemon.hp,
      player.secondaryPokemon.status.currentHP,
      attacks
    );

    return c.newResponse(image, 200, {
      'Content-Type': 'image/png',
      'Cache-Control': 'max-age=0', //try no-cache later
    });
  } catch (error) {
    console.error("Error generating image:", error);
    return c.newResponse("Error generating image", 500);
  }
});

app.hono.get('/image/pokemon/:id/:name/:type/:hp/:atk/:def/:spd', async (c) => {
  try {
    const id = Number(c.req.param('id'));
    const name = c.req.param('name')
    const type = c.req.param('type')
    const hp = Number(c.req.param('hp'))
    const atk = Number(c.req.param('atk'))
    const def = Number(c.req.param('def'))
    const spd = Number(c.req.param('spd'))
    const image = await generatePokemonCard(id, name, type, hp, atk, def, spd) //review this later

    return c.newResponse(image, 200, {
      'Content-Type': 'image/png',
      'Cache-Control': 'max-age=0', //try no-cache later
    });
  } catch (error) {
    console.error("Error generating image:", error);
    return c.newResponse("Error generating image", 500);
  }
});

app.hono.get('/image/waiting/:pfp_url', async (c) => {
  try {
    // const pfp_url = c.req.param('pfp_url');
    // const image = await generateWaitingRoom(pfp_url); implement this later
    const image = await generateWaitingRoom();
    return c.newResponse(image, 200, {
      'Content-Type': 'image/png',
      'Cache-Control': 'max-age=0', //try no-cache later
    });
  } catch (error) {
    console.error("Error generating image:", error);
    return c.newResponse("Error generating image", 500);
  }
});

app.hono.get('/image/checkout/:p1/:p2/:p3', async (c) => {
  try {
    const p1 = Number(c.req.param('p1'));
    const p2 = Number(c.req.param('p2'));
    const p3 = Number(c.req.param('p3'));
    const pokemonIds = [p1, p2, p3];
    const image = await generateBattleConfirm(pokemonIds);
    return c.newResponse(image, 200, {
      'Content-Type': 'image/png',
      'Cache-Control': 'max-age=0', //try no-cache later
    });
  } catch (error) {
    console.error("Error generating image:", error);
    return c.newResponse("Error generating image", 500);
  }
});

app.hono.get('/image/fight/:gameId/user/:userFid', async (c) => {
  try {
    const gameId = Number(c.req.param('gameId'));
    const battle: any = await getBattleById(gameId);
    const { player } = getPlayers(Number(c.req.param('userFid')), battle);

    let attacks: any = [];

    player.currentPokemon.moveDetails.forEach((move: any) => {
      attacks.push({ atk: move.name, type: { name: move.type, color: getPokemonTypeColor(move.type) } });
    })

    // const status = {
    //   atk: player.currentPokemon.attack,
    //   def: player.currentPokemon.defense,
    //   spd: player.currentPokemon.speed,
    // }

    // const image = await generateFight(player.currentPokemon.name, player.currentPokemon.id, player.currentPokemon.hp, player.currentPokemon.status.currentHP, attacks, status)  implement this later
    const image = await generateFight(player.currentPokemon.name, player.currentPokemon.id, player.currentPokemon.hp, player.currentPokemon.status.currentHP, attacks)

    return c.newResponse(image, 200, {
      'Content-Type': 'image/png',
      'Cache-Control': 'max-age=0', //try no-cache later
    });
  } catch (error) {
    console.error("Error generating image:", error);
    return c.newResponse("Error generating image", 500);
  }
});

app.hono.get('/image/battlelist/:p1/:p2/:p3/:fid', async (c) => {
  const fid = Number(c.req.param('fid'));
  const { pfp_url, userName } = await getFarcasterUserInfo(fid);

  try {
    const p1 = Number(c.req.param('p1'));
    const p2 = Number(c.req.param('p2'));
    const p3 = Number(c.req.param('p3'));

    const image = await generateBattleList([p1,p2,p3], pfp_url, userName);

    return c.newResponse(image, 200, {
      'Content-Type': 'image/png',
      'Cache-Control': 'max-age=0', 
    });
  } catch (error) {
    console.error("Error generating image:", error);
    return c.newResponse("Error generating image", 500);
  }
});

app.hono.get('/image/trending', async (c) => {
  const trendingData = await fetchTopContributors();
  // console.log(trendingData);
  try {
    const image = await generateTrending(trendingData);
    return c.newResponse(image, 200, {
      'Content-Type': 'image/png',
      'Cache-Control': 'max-age=0', 
    });
  } catch (error) {
    console.error("Error generating image:", error);
    return c.newResponse("Error generating image", 500);
  }
});


if (process.env.NODE_ENV !== 'production') {
  devtools(app, { serveStatic });
}

serve({ fetch: app.fetch, port: Number(process.env.PORT) || 5173 });
console.log(`Server started: ${new Date()} `);

export const GET = handle(app)
export const POST = handle(app)