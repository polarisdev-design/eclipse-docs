# Server API

```lua
local Eclipse = require(game:GetService("ServerScriptService").Eclipse)
```

The included Server script starts this module. Its public methods are listed below.

| Member | Returns or does |
| --- | --- |
| GetOutfit(player) | An outfit copy, or nil if the player leaves; yields for initial data |
| ApplyOutfit(player, outfit) | Validates and submits a whole outfit; yields and returns a boolean |
| OutfitApplied | Fires with player and the accepted outfit after application |
| ListOutfits(player) | The player's saved-outfit summaries |
| SaveOutfit(player, name, outfit) | Saves the supplied draft after validation |
| LoadOutfit(player, id, revision) | Loads an entry using its current revision |
| ManageOutfit(player, action, payload) | Runs another saved-outfit or import action |
| UseOutfitStorage(driver) | Sets the storage driver before the first storage request |
| Start / Get / IsReady / AwaitReady | Framework startup and registered module access |

## Reading a result

Saved-outfit requests return `Ok` and `Message`. Other fields depend on the action. Check Ok before reading Entries, SelectedId or Outfit.

```lua
local Result = Eclipse.ListOutfits(player)
if Result.Ok then
    for _, Entry in Result.Entries do
        print(Entry.Id, Entry.Name, Entry.Revision)
    end
else
    warn(Result.Message)
end
```

## ManageOutfit

| Action | Payload fields |
| --- | --- |
| List | None |
| Preview / Load | Id, Revision |
| Save | Name, Outfit |
| Rename | Id, Revision, Name |
| Overwrite | Id, Revision, Outfit |
| Delete | Id, Revision |
| ImportReview | Code; optional Outfit base |
| ImportApply | Token |

ImportReview returns Token, Name, Preview, Warnings, Imported, Omitted, Adjusted and Version.

An import token belongs to the requesting player, expires after two minutes and can only be used once. Applying it changes the current outfit; it does not save it.

## Applying an outfit

Get the current outfit before changing a field. ApplyOutfit replaces the whole table, so an incomplete replacement can clear things the player was wearing.

The return value reports whether the submission was accepted. Use OutfitApplied for the applied snapshot, or GetOutfit for the current server state.

## Replacing storage

The driver must provide GetAsync and UpdateAsync. Call UseOutfitStorage before any list, save or load request.

[Outfits](/learn/outfits) describes the stored profile and update behavior.
