# Schema


What you'll learn: how Eclipse describes a whole look as one plain table, why it does it
that way, and how to add a field without breaking anything.

## The Idea


Everything about a player's look lives in one table called the outfit. It is what the
client sends, what the server checks and keeps, what the server API hands out, and what a
save system would store.

It only holds plain data: numbers, strings, booleans, Color3 and Vector3. No instances.
That matters because:

- An instance can't be saved in a DataStore, and through a remote it only arrives as a
  reference to something both sides can already see. Plain tables travel through remotes
  as they are, Color3 and Vector3 included. For saving, Data.buffer packs the table into
  compact binary (guide 12).
- Plain data is easy to compare, copy and check.
- The client can edit its copy freely without touching the real character.

## Where It Lives


```text
Data.schema         the shape of the outfit, the default outfit, and lookup tables
Data.serializer     converts an outfit into a HumanoidDescription and back
Data.buffer         packs an outfit into binary for saving (guide 12)
Libraries.table     DeepCopy, DeepEquals and Reconcile for working with outfits
```

## The Shape


From Schema.Default:

```text
Schema.Default = {
	Version = Schema.Version,
	SkinColor = Color3.fromRGB(234, 184, 146),
	BodyTransparency = 0,
	BodyAppearance = {},
	Scale = { Height = 1, Width = 1, Depth = 1, Head = 1 },
	Body = { Face = 0, Head = 0, Torso = 0, LeftArm = 0, RightArm = 0, LeftLeg = 0, RightLeg = 0 },
	Clothing = { Shirt = 0, Pants = 0, TShirt = 0 },
	Animations = { Idle = 0, Walk = 0, Run = 0, Jump = 0, Fall = 0, Climb = 0, Swim = 0 },
	Accessories = {},
	Identity = {},
}
```

- An asset id of 0 means the slot is empty.
- Scale holds the four body scales Eclipse controls. A height of 1 is
  Configuration.Height.BaseInches tall (62.7 inches, about 5'3"), so a height in inches
  divided by BaseInches gives the scale.
- SkinColor colors the whole body. BodyAppearance holds overrides by body group ("LeftArm")
  or by part ("LeftHand"), each with an optional Color and Transparency. A part override
  wins over its group's, which wins over SkinColor.
- Accessories is a list. Each entry looks like this:

```text
{
	AssetId = 123,
	Type = "Hat",                     -- filled in by the server
	Position = Vector3.zero,          -- studs from its normal spot
	Rotation = Vector3.zero,          -- degrees
	Scale = Vector3.one,              -- times its normal size
	Color = nil,                      -- optional overrides
	TextureId = nil,
	Material = nil,
	AttachmentPart = nil,             -- hang it from a different body part
	Name = nil,                       -- optional display name
	Transparency = nil,               -- optional, 0 to 1
}
```

The order of Accessories matters for layered clothing: earlier items are worn underneath.

- Identity holds the roleplay Name and Bio, both optional strings. They are filtered by
  the server before anyone sees them (guide 15).

## Imported Meshes


An accessory can also be a raw mesh rather than a catalog item, for example one brought
in by the importer (guide 14). Those entries have three more fields:

```text
MeshId     the mesh asset to load
MeshSize   the mesh's base size in studs. Scale is still a multiplier on top of it
Key        a unique id for this copy, so two copies of the same mesh stay separate
```

AssetId keeps the source id. Raw meshes aren't part of the HumanoidDescription:
Helpers.mesh loads them and adds or removes them on the character, and welding places
them like any other accessory, on the Head unless AttachmentPart says otherwise.

## One List Of Slots


Every single-asset slot (face, body parts, clothing, animations) is one line in
Schema.AssetSlots:

```text
Slot("Clothing", "TShirt", "GraphicTShirt", Enum.AssetType.TShirt),
```

That line says: the id lives at outfit.Clothing.TShirt, it sets the HumanoidDescription's
GraphicTShirt property, and only T-shirt assets are accepted. The serializer, the server's
validation and the editor all loop over this list, so none of them mention slots by
name. Adding a slot is one line here plus its default (guide 11 walks through it).

## To And From A Humanoiddescription


Serializer.ToDescription builds a new description from an outfit. The caller owns it and
must destroy it after applying it. Accessory positions are left at their defaults here,
because Eclipse places accessories itself after the apply (guide 05).

Serializer.FromDescription goes the other way. The server uses it to convert a player's own
Roblox avatar into their starting outfit. Its result hasn't been checked yet, so it always
goes through Validation.Clean before it is used.

## Adding Fields Safely


Saved outfits outlive your code. If you add a field later, an outfit saved before then
won't have it. Table.Reconcile fixes that by filling in any missing keys from the default:

```text
Table.Reconcile(savedOutfit, Schema.Default)
```

It never overwrites what is already there, and it treats lists (like Accessories) as one
value instead of merging them item by item.

Schema.Version is a number stored in every outfit. Bump it whenever the shape changes in a
way Reconcile can't handle on its own (a field renamed or a meaning changed), so loading
code can tell old outfits apart and convert them. Version 2 added body transparency,
per-part colors and the accessory appearance fields. Version 3 added accessory Name and
Transparency, and the imported mesh fields. Version 4 added Identity.

Saved outfits have a separate version of their own: Data.buffer's format version, which
describes the binary layout rather than the table (guide 12).

## Try It


In the command bar (edit mode is fine):

```lua
local Eclipse = game.ReplicatedStorage.Eclipse
local Schema = require(Eclipse.Data.schema)
local Serializer = require(Eclipse.Data.serializer)
local Table = require(Eclipse.Libraries.table)

local outfit = Table.DeepCopy(Schema.Default)
outfit.Scale.Height = 1.1
local description = Serializer.ToDescription(outfit)
print(description.HeightScale)          --> 1.1 (as a float: 1.100000023841858)
description:Destroy()
```

## Common Mistakes


- Editing Schema.Default directly instead of a copy. Always Table.DeepCopy it first, or
  every new outfit after that starts with your change.
- Putting an instance in the outfit. It won't survive a remote or a DataStore.
- Comparing two outfits with ==. Two tables are only == if they are the same table. Use
  Table.DeepEquals.
- Forgetting to destroy the HumanoidDescription from ToDescription.
