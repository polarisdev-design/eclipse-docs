# Server API

Require ServerScriptService.Eclipse. Startup is handled by its Server child script.

| Member | Behavior |
| --- | --- |
| GetOutfit(player) | Yields for initial data; returns an outfit copy, or nil if the player leaves |
| ApplyOutfit(player, outfit) | Validates and submits the complete outfit; yields; returns a boolean |
| OutfitApplied | Signal carrying player and the accepted outfit after application |
| ListOutfits(player) | Returns the player's saved-outfit summaries |
| SaveOutfit(player, name, outfit) | Saves the supplied draft after validation |
| LoadOutfit(player, id, revision) | Loads an existing entry using its current revision |
| ManageOutfit(player, action, payload) | Routes other saved-outfit and import operations |
| UseOutfitStorage(driver) | Sets a storage driver before the first storage request |
| Start / Get / IsReady / AwaitReady | Framework lifecycle and module access |

## Saved-outfit results

Requests return an object with Ok and Message. Success responses supply action-specific fields, such as Entries, SelectedId or Outfit. Check Ok before using those fields.

```lua
local response = Eclipse.ListOutfits(player)
if response.Ok then
    for _, entry in response.Entries do
        print(entry.Id, entry.Name, entry.Revision)
    end
end
```

## ManageOutfit actions

| Action | Payload |
| --- | --- |
| List | No payload required |
| Preview / Load | Id, Revision |
| Save | Name, Outfit |
| Rename | Id, Revision, Name |
| Overwrite | Id, Revision, Outfit |
| Delete | Id, Revision |
| ImportReview | Code; Outfit may supply a base |
| ImportApply | Token from a successful review |

ImportReview returns Token, Name, Preview, Warnings, Imported, Omitted, Adjusted and Version. Tokens are player-bound, single-use and expire. Applying does not automatically save.

## Appearance submission

ApplyOutfit submits a whole outfit. Always start from GetOutfit when changing a single field. Its boolean reports submission status; OutfitApplied carries an accepted applied snapshot. GetOutfit returns the current server snapshot.

## Custom storage

A storage driver supplies GetAsync and UpdateAsync. Configure it before any list, save or load request. See [Outfits](/learn/outfits) for the profile contract and concurrency behavior.
