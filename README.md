This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, create a copy of `.env.example` and rename it to `.env.local`. [Create an API Key](https://aistudio.google.com/apikey) for Google Gemini and replace `your_google_ai_api_key_here` with your key.

```bash
npm install
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

## Approach

### Setup

I decided to bootstrap the project with create-next-app as create-react-app is now deprecated.

I opted to keep most of the project code in `Game.tsx`. I'd probably break it down so each component and util has its own folder/file but I thought it'd be easier to review this way.

### Process

In `Game.tsx` I have a some config and utils that could be moved out at the top. I've elevated all of the state logic for my app to the top of the Game component. since the state is relatively simple, I decided not to use a reducer or a state machine and just opted to use 4 useStates and 1 useEffect to control the game.

For [step 1](https://github.com/bhardy/tic-tac-ai/blob/418704eac1c571eb8ac0255e6dceb6b9df9a4240/src/components/TicTacToe/Game.tsx#L68-L87), I set my `handleComputerChoice` function to randomly pick a random available cell.

For [step 2](https://github.com/bhardy/tic-tac-ai/blob/main/src/components/TicTacToe/Game.tsx#L90-L102) the only real change is that instead of picking a cell randomly, I asked Google Gemini to pick one.

### Challenges

I didn't expect to end up with 4 different useStates. I think a few of them could be derrived, I'll speak to that in the next section. The biggest issue I found is that Gemini is bad at Tic Tac Toe. I spent a bit of time trying to write a prompt and supply it with context that would teach it how to win the game, but it still plays poorly and slowly.

### More Time

I'd change the data structure that holds the `gameState` to a 2D array where each move pops a new game state into the array. That would allow me to remove the state for `turn` as I could just count the length of the outer `gameState` array.

It would have been cleaner (and easier to maintain in the future) to elevate the play again logic up above the `Game` component. I'd remove the `handleResetGame` function from `Game` and I'd just put a key prop on `Game` with an incremented integer and pass down a reset function that ups the integer, this would dump the game state automatically. To do this I'd have to wrap `Game` in another component since the `page` is a server component.

The styling could use some love, especially the hover cases on the actual tic-tac-toe board, the 'thinking' state, and the final game state.

I'd also add a unit test for `getFinalGameStatus` as I caught a bug pretty late where it would say it was a draw if the winning play was the last available cell.

I think there should be some handling for if the AI bot returns an index that is out of bounds or already used but in my testing I didn't see it make that mistake (which is a little surprising because it's very bad at the game).

Lastly... I'd rename `handleComputerChoice` as that's not a response to any user input. I opted to leave it to remove confusion when distinguishing between steps 1 and 2.
