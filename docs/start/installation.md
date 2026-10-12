# Installation

Place the two Eclipse modules in these services:

```text
ReplicatedStorage
  Eclipse (ModuleScript)
    Runtime (Script, RunContext = Client)
    Core, Controllers, Config, Data, Helpers
    Interface, Libraries, Packages, Remotes, Docs
    license

ServerScriptService
  Eclipse (ModuleScript)
    Server (Script)
    Services
    Modules
```

Keep their children and attributes. Both entry scripts are included: `Runtime` starts the client and `Server` starts the server. Nothing needs to go in StarterPlayerScripts.

This repository contains the docs, not the Roblox model.

## Before running it

1. Set the experience's avatar type to R15.
2. Check that `ReplicatedStorage.Eclipse.Runtime.RunContext` is Client.
3. Open `Config.configuration` and set the appearance rules for your game.
4. Check that your experience can load the animation in `Interface.Assets.CustomizationIdle`.

For Studio save tests, enable access to API services in your test experience. Studio saves use a separate DataStore suffix.

## Remotes

The package includes these instances:

```text
ReplicatedStorage.Eclipse.Remotes.Customization
  GetOutfit     RemoteFunction
  ApplyOutfit   RemoteEvent
  OutfitApplied RemoteEvent
```

If you are building Eclipse from individual modules, create these in Studio before starting it.

## First playtest

Open the avatar icon and change an accessory. Close the editor and check that movement and the camera return to normal.

Then save an outfit, change something, and load the save. Use a two-client test for names, bios and character sheets.

If it doesn't start, check the first Eclipse error in Output. See [troubleshooting](/reference/troubleshooting) for common causes.

Continue with [configuration](/guides/configuration). The [Introduction](/learn/introduction) lists the complete hierarchy.
