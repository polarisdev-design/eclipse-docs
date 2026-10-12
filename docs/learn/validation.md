# Validation


What you'll learn: why the server checks every outfit a client sends, how Eclipse checks
one without ever erroring, and how it stops a client from flooding the server.

## The Idea


Anything a client sends can be anything. An exploiter can call a RemoteEvent with any
value they like: a string where a number should be, an asset id for a banned item, a body
scale of 1000, a list of 50,000 accessories, NaN, or a table nested a thousand levels
deep. The editor's own interface never sends any of that, but the server can't know that
the interface sent the request.

So the server follows one rule: never trust the client. It doesn't fix up what the client
sent. It starts from a blank outfit and copies across only the values that pass a check.
Anything it doesn't recognise is simply never copied, and anything that fails a check
falls back to the default.

## Where It Lives


```lua
Remotes.Customization            GetOutfit, ApplyOutfit, OutfitApplied
ServerScriptService.Eclipse
	Services.service             listens to the remotes and applies rate limits
	Modules.validation           Validation.Clean, the outfit checker
Libraries
	check                        small checks that return a clean value or nil
	limiter                      the rate limiter
	cache                        remembers marketplace lookups
```

## The Remotes


```text
GetOutfit       RemoteFunction   the client asks for its current outfit
ApplyOutfit     RemoteEvent      the client sends the outfit it wants
OutfitApplied   RemoteEvent      the server answers with what it actually put on
```

The answer can differ from what was sent. If a player asks for a banned hat, the server
simply leaves it out, and the client learns that from OutfitApplied (guide 09).

## Rate Limits


Each check costs the server time, and some cost a web call, so the server limits how often
each player can ask. Libraries.limiter is a token bucket: each player has a bucket of
tokens, every request uses one, and tokens refill over time. The first two limits below
are in service, the third in validation:

```lua
local ApplyLimit = RateLimiter.new(8, 1)       -- 8 outfits a second
local GetLimit = RateLimiter.new(4, 1)         -- 4 GetOutfit calls a second
local LookupLimit = RateLimiter.new(40, 10)    -- 40 new asset lookups every 10 seconds
```

A bucket lets a player make a short burst of requests (dragging a slider) while still
capping the total over time. A request over the limit is silently dropped.

## A Walk Through Validation.clean


```lua
function Validation.Clean(raw: any, player: Player?)
	local outfit = Table.DeepCopy(Schema.Default)
	if type(raw) ~= "table" then
		return outfit
	end

	CleanBodyLook(outfit, raw)
	CleanScale(outfit, raw)

	local lookups = {}
	local slotIds = ReadSlots(raw, lookups)
	local entries = ReadAccessories(raw, lookups)

	FetchAssetTypes(lookups, player)

	PlaceSlots(outfit, slotIds)
	PlaceAccessories(outfit, entries)
	return outfit
end
```

Step by step:

1. Start from a copy of the default outfit. If raw isn't even a table, that copy is the
   answer.
2. CleanBodyLook copies the skin color, body transparency and color overrides. Only known
   body group and part names are read, so made-up keys never survive. CleanIdentity
   cleans the roleplay name and bio (guide 15); they are filtered later, in the service.
3. CleanScale clamps each body scale into the range in Config.configuration. Height's
   range comes from Height.MinInches and MaxInches, divided by BaseInches.
4. ReadSlots and ReadAccessories read asset ids and note every id that needs checking.
   ReadAccessories drops repeats and never reads more entries than could ever be allowed,
   so a list of 50,000 items costs no more than a list of 56 (the default limits).
5. FetchAssetTypes asks the marketplace what each id really is, all at the same time.
6. PlaceSlots only puts an id in a slot if its real type fits that slot. A hat id sent as
   a shirt is dropped.
7. PlaceAccessories adds accessories whose real type is allowed, up to the limits in the
   configuration. The Type field comes from the marketplace, never from what the client
   said. An accessory's optional Name is kept only if it is short, valid text with no
   control characters, and its Transparency is clamped between 0 and 1.

Imported mesh entries (guide 03) go through the same steps with a few extra checks. The
MeshId must really be a mesh asset (or one the server has already loaded), MeshSize must
be between 0.001 and 100 studs on each axis, and Key must be a short id made only of
letters, digits and dashes. They count toward MaxAccessories. Repeats are dropped by Key
for meshes and by AssetId for everything else, so two copies of one mesh can both be
worn.

Clean never errors on bad input. One strange request can't break the server, and the
player just gets the parts of their outfit that were valid.

## The Check Library


Every function in Libraries.check takes a value nobody has vetted and returns a clean
copy, or nil:

```text
Check.AssetId(value)           a whole number from 1 to 2^53
Check.Clamp(value, min, max)   a finite number pulled into range
Check.Color3(value)            a real Color3 with every channel between 0 and 1
Check.Vector3(value, min, max) a real Vector3 with each axis clamped
```

They all reject NaN and infinity. NaN is sneaky: it isn't less than, greater than or equal
to anything (not even itself), so a check like "value &gt; max" lets it straight through.

## Cached Lookups


Asking the marketplace about an asset is a web call. It is slow and Roblox limits how many
a server can make. An asset's type never changes, so the answer is kept in a Cache for an
hour. A failed lookup is only kept for a minute, in case Roblox was just having trouble.

```lua
local AssetTypes = Cache.new(3600, 2000)
local FailedLookups = Cache.new(60, 2000)
```

## Text


Modules.filter checks player-written text, such as saved outfit names (guide 13). Any text
one player writes that other players will see must go through Roblox's filter first; that
is a Roblox rule. Filter.ForBroadcast fails closed: if the filter errors, the text is
refused rather than shown unfiltered.

## Try It


Put this in a Script in ServerScriptService and playtest:

```lua
local Validation = require(game.ServerScriptService.Eclipse.Modules.validation)
local outfit = Validation.Clean({
	Scale = { Height = 1000, Width = 0 / 0 },
	Junk = "hello",
	Clothing = { Shirt = -5 },
})
print(outfit.Scale.Height, outfit.Scale.Width, outfit.Junk, outfit.Clothing.Shirt)
--> 1.1  1  nil  0
```

## Common Mistakes


- Checking a client's value and then using the original. Always use the clean copy.
- Trusting a Type, AssetTypeId or name the client sent. Look it up on the server.
- Forgetting NaN. Use Check, or test value == value.
- Looping over a client's list without a cap.
- Making a web call per request with no cache and no rate limit.
