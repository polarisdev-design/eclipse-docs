# Integration


What you'll learn: how to use Eclipse from your own scripts, add a new slot, and
where a save system plugs in.

## The Server Api


Other server scripts use ServerScriptService.Eclipse:

```text
Eclipse.GetOutfit(player)           a copy of the player's outfit. Yields until it has
                                    loaded, and returns nil if they leave first
Eclipse.ApplyOutfit(player, outfit) checks the outfit against the configuration and
                                    puts it on. Yields. Returns false if the player
                                    left or a newer outfit replaced this one
Eclipse.OutfitApplied               a signal that fires with (player, outfit) after
                                    every apply, respawns included
```

It also has the startup calls from guide 02 (Start, Get, IsReady, AwaitReady) and the saved
outfit calls from guide 13 (ListOutfits, SaveOutfit, LoadOutfit, ManageOutfit and
UseOutfitStorage).

ApplyOutfit replaces the whole outfit, so always get the current one, change it, and pass
it back. Outfits from your own scripts go through the same checks as a player's, so a
server script can't put on something the configuration forbids either.

Example: a uniform for a team, in a server Script.

```lua
local Players = game:GetService("Players")
local Eclipse = require(game:GetService("ServerScriptService").Eclipse)

local PoliceShirt = 123456
local PolicePants = 654321

local function Dress(player)
	if player.Team and player.Team.Name == "Police" then
		local outfit = Eclipse.GetOutfit(player)
		if outfit then
			outfit.Clothing.Shirt = PoliceShirt
			outfit.Clothing.Pants = PolicePants
			Eclipse.ApplyOutfit(player, outfit)
		end
	end
end

Players.PlayerAdded:Connect(function(player)
	player:GetPropertyChangedSignal("Team"):Connect(function()
		Dress(player)
	end)
	Dress(player)
end)
```

Example: give everyone a hat.

```lua
local outfit = Eclipse.GetOutfit(player)
table.insert(outfit.Accessories, {
	AssetId = 123456789,
	Position = Vector3.zero,
	Rotation = Vector3.zero,
	Scale = Vector3.one,
})
Eclipse.ApplyOutfit(player, outfit)
```

You don't need to give the Type; the server looks it up.

## Changing The Rules


Everything players are allowed to wear is in Config.configuration (see guide 00). Change
it there rather than in the validation code, and the server, the editor and your own
scripts all follow the new rules.

## Adding A Slot


Say you want a mood animation slot. HumanoidDescription has a MoodAnimation property, so:

1. In Data.schema, add a line to Schema.AssetSlots:

```text
Slot("Animations", "Mood", "MoodAnimation", Enum.AssetType.MoodAnimation),
```

2. In Schema.Default, add Mood = 0 to the Animations table.

3. In Interface.Assets.Customization.Window.Editor.Pages.Animations, duplicate an
   existing asset field and name it MoodAsset. Edit its label to Mood.

The serializer and validation use AssetSlots. The tab binds each slot to its matching
stored field. Old outfits pick up Mood = 0 through Table.Reconcile (guide 03).

## Named Outfit Saving


Services.outfits and Modules.storage provide explicit named saves. Guide 13 covers
the server API, requests and persistence; guide 12 explains Data.buffer.

Joining uses the normal starting avatar. Saved outfits are applied only when the player
chooses Load. Do not connect OutfitApplied to automatic saving or restore a last-worn
outfit in LoadStartingOutfit.

When adding a persisted slot, update the buffer format as well as Schema.AssetSlots.
Introduce a new format version while retaining the old reader for existing saves.

## Common Mistakes


- Building a new outfit table from scratch for ApplyOutfit. Start from GetOutfit, or the
  player loses everything else they were wearing.
- Editing validation to allow something. Change Config.configuration instead.
- Saving on every OutfitApplied fire.
- Loading a saved outfit without Reconcile and Clean.
