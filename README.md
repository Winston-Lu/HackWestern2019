# HackWestern2019
Repository for HackWestern 2019


To run, clone the repository to your computer, then navigate to that folder. In a terminal window (assuming `npm` is installed), run `npm install` to install the required dependencies. The output should be on a website such as `localhost:3000`. 

To enable voice, a Google API key is required. If you want to skip the voice portion of the game, navigate to `/public/src/html/d3-game.js`.
On line 162, change the following:
```
await $.get('getVoice', (data) => {
    googleVoice = data;
})
```
to:
```
await $.get('getVoice', (data) => {
    googleVoice = data;
})
googleVoice = "water";
```
This will skip the dialog requiring the user to command what they wanted the player to do.
        
