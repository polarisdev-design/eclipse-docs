# Applying


What you'll learn: what happens on the server between a client sending an outfit and the
character changing, and the timing problems Eclipse has to handle along the way.

## The Idea


Putting an outfit on sounds like one call to ApplyDescriptionAsync. In practice:

- the character may not be ready yet, or may respawn halfway through
- checking an outfit and applying it both yield, so requests can overlap
- a player dragging a slider sends several outfits a second
- a full description apply is slow, and most edits don't need one

Services.service handles all of this, so the rest of Eclipse can just ask for an outfit.

## Where It Lives


```text
ServerScriptService.Eclipse.Services.service
	Submit             checks an outfit and queues it
	ApplyPending       applies queued outfits one at a time
	GetReadyHumanoid   waits for the character
	PutOn              chooses the fast path or a full apply
	ApplyDescription   the full apply, with a fallback
	SameAssets         decides whether the fast path is possible
ReplicatedStorage.Eclipse.Helpers.body   scale, colors and transparency without an apply
```

## The Session


Every player in the game has a session table:

```text
type Session = {
	Outfit: Outfit?,      -- nil until loaded
	Queued: Outfit?,      -- a checked outfit waiting to be put on
	Applying: boolean,    -- one apply at a time
	NeedsApply: boolean,  -- respawned, needs reapplying
	Requests: number,     -- so older requests can't overwrite newer ones
}
```

When a player joins, LoadStartingOutfit converts their own Roblox avatar into an outfit, so
they start looking like themselves. If that fails they start from Schema.Default.

## Numbered Requests


Validation.Clean yields while it asks the marketplace about new assets. If a player sends
outfit A and then outfit B, A's check might finish after B's. Without care, A would be put
on last and the player's newest change would be lost.

So every request gets a number:

```lua
session.Requests += 1
local request = session.Requests
local outfit = Validation.Clean(raw, if fromClient then player else nil)
-- new names and bios are filtered before anyone can see them
Identity.Resolve(player, session.Outfit, outfit, fromClient)

if Sessions[player] ~= session or session.Requests ~= request then
	return false
end
```

Identity.Resolve filters any new roleplay name or bio, which also yields (guide 15).
After the check, if a newer request has started (or the player left), this one quietly
gives up.

## Only The Newest Outfit


ApplyPending runs one apply at a time. While it works, new outfits land in session.Queued,
and each new one replaces the last. When an apply finishes, the loop takes whatever is
queued. If five outfits arrive during one apply, only the fifth is put on, because the
other four would be replaced straight away anyway.

## Waiting For The Character


CharacterAdded fires before the character is in the world and before its default look has
loaded. An outfit applied that early gets overwritten by the default look. WaitUntilReady
waits (up to five seconds) until the character is in Workspace and
player:HasAppearanceLoaded() is true.

When the character respawns, NeedsApply is set, and the loop puts the saved outfit on the
new character.

## The Full Apply


```lua
local ok, message = pcall(humanoid.ApplyDescriptionAsync, humanoid, description)
if not ok then
	-- fall back to a full reset
	ok, message = pcall(humanoid.ApplyDescriptionResetAsync, humanoid, description)
end
```

Before applying, the current emotes are copied onto the new description. A new
HumanoidDescription has no emotes, so without this a player would lose theirs every time
they changed outfit.

## Load First, Then Change


Anything that yields after the look starts changing shows on screen. If an imported mesh
was added to the character and the server then waited for the next one to download, the
first would sit on the head, in its default spot and with no color or texture, until the
rest arrived and everything was placed.

So a full apply loads everything it needs before it changes anything: AccessoryTags.Preload
looks up every catalog accessory and Mesh.Preload downloads every imported mesh, all at the
same time. After that, nothing between the description apply and the end of PutOn yields.
The new accessories are added, placed, colored and textured in one frame, so players only
ever see the finished outfit.

## The Fast Path


Most edits only change looks: a color, a body scale, transparency, or where an accessory
sits. None of those need the engine to load anything. SameAssets checks whether two outfits
wear exactly the same assets:

```lua
if not Table.DeepEquals(a.Body, b.Body) then return false end
if not Table.DeepEquals(a.Clothing, b.Clothing) then return false end
if not Table.DeepEquals(a.Animations, b.Animations) then return false end
-- then each accessory's AssetId, MeshId, Key and MeshSize, compared in order
```

(The real function writes each check over three lines.) If the assets match, PutOn skips
the description apply:

```lua
local fast = not afterRespawn and SameAssets(session.Outfit, outfit) and BodyAppearance.CanScale(humanoid)

if not fast then
	AccessoryTags.Preload(outfit)
	Mesh.Preload(outfit)
	if not ApplyDescription(player, humanoid, outfit) then
		return false
	end
	-- new accessories need tagging
	AccessoryTags.Tag(character, outfit)
end

if not Mesh.Sync(character, outfit) then
	return false
end
if edit then
	ReplaceStale(session, outfit)
else
	table.clear(session.Refits)
end
if BodyAppearance.ScaleDiffers(humanoid, outfit) then
	local poses = if edit then Welding.CapturePoses(character, outfit) else {}
	Welding.ResetAll(character)
	BodyAppearance.Apply(character, outfit, true)
	RecordRefits(session, Welding.RefitPoses(poses, Configuration.AccessoryOffset, Configuration.AccessoryScale))
else
	BodyAppearance.Apply(character, outfit, true)
end
Welding.ApplyOutfit(character, outfit)
Identity.Apply(character, outfit)
```

(The real code has a comment above the scale check.) The scale steps are explained below.
Identity.Apply writes the name and bio to the character, where every client reads them.

Both paths finish the same way. Mesh.Sync adds or removes imported mesh accessories,
which aren't part of the description (guide 05). BodyAppearance.Apply sets the humanoid's
scale values, the part colors, BodyColors and transparency directly. Welding.ApplyOutfit
places and restyles accessories (guide 05). The fast path is the reason dragging a color
or moving a hat feels instant, and it keeps the same accessory instances instead of
rebuilding them.

## Scaling And Accessories


When the player changes a body scale in the editor, every accessory keeps the same offset
from the centre of the body part it hangs from, and its size grows or shrinks in
proportion to that part. A hat stays the same distance from the centre of the head while
the head doubles in size, and the hat doubles with it.

When body scale changes, the engine rescales every accessory straight away, starting from
wherever the accessory is now (guide 01). That would scale any offset the player gave it,
so the server does this, all in the same frame so nothing flickers:

1. Welding.CapturePoses records each accessory's offset from its body part's centre and
   its size relative to that part. It works this out from the joint rather than from
   world positions, so it's right even before physics catches up.
2. Welding.ResetAll puts every placed accessory back at its saved base (guide 05).
3. BodyAppearance.Apply sets the scale values, and the engine rescales the clean base.
4. Welding.RefitPoses changes each outfit entry's Position and Scale so that, on the new
   base, the accessory lands at the captured offset and relative size. The values are
   clamped to AccessoryOffset and AccessoryScale.
5. Welding.ApplyOutfit places everything as usual.

The refit changes the outfit itself, so the new Position and Scale are saved, replicated
and sent back to the client like any other change. Only edits from the editor are refit.
Saved outfits, imports and server scripts are placed exactly as they were stored.

One more detail: the editor keeps sending its own copy of the outfit until the server's
answer settles (guide 09), so a second edit can still carry a position the refit just
replaced. The session remembers the values each refit replaced (Session.Refits), and
ReplaceStale swaps any it sees for the refit values, so the accessory doesn't jump back.

The client doesn't set scale values itself. The body tab previews colors and transparency
locally with BodyAppearance.ApplyLook and leaves scale to the server, which replicates the
result.

BodyAppearance saves each part's original transparency in an attribute the first time, so a
body transparency of 0.5 on a part that was already half see-through looks right, and going
back to 0 restores the asset's own look.

## After An Apply


When an outfit goes on, the session keeps it, the server-side OutfitApplied signal fires
for your own scripts, and the OutfitApplied remote tells the client what was actually
accepted.

Service.ApplySavedOutfit(player, outfit) is the waiting version, used when a saved or
imported outfit is loaded (guides 13 and 14). It queues the outfit like any other, waits
until the apply loop has finished, and returns two values: whether exactly that outfit
went on, and a copy of the outfit the server accepted.

The GetOutfit RemoteFunction has two jobs. Called with no arguments it returns the
player's current outfit. Called with "SavedOutfits" first, it passes the request to
Services.outfits instead (guide 13).

## Try It


Playtest, then in a server Script (not the command bar, see guide 16):

```lua
local Eclipse = require(game.ServerScriptService.Eclipse)
Eclipse.OutfitApplied:Connect(function(player, outfit)
	print(player.Name, "now has", #outfit.Accessories, "accessories")
end)
```

Open the editor and change a color, then add a hat. Both print, but only the hat needed a
full apply.

## Common Mistakes


- Applying in CharacterAdded straight away. Wait until the character is ready.
- Letting two applies run at once on one character.
- Doing a full description apply for every slider movement.
- Forgetting that a description apply resets accessories, so anything placed by a script
  has to be placed again afterwards.
