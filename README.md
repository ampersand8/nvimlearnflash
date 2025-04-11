# Neovim Learn Flashcards

## Build and deploy

Build and run locally with docker

```
docker build --no-cache -t neovim-flashcards .
docker run -d -p 8080:80 --name neovim-flashcards-app neovim-flashcards
```


## Get Your Keymappings

The following will create a `neovim_keymaps.json` file with all your keymappings.

```
nvim
:luafile scripts/export_keymaps.lua
```

