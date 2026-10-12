# Buffer


Data.buffer is Eclipse's small binary storage codec. It converts an outfit into a
native Roblox buffer and reconstructs it. This is a storage format, not a public outfit
code, encryption layer or replacement for the runtime outfit table.

```lua
local Codec = require(game:GetService("ReplicatedStorage").Eclipse.Data.buffer)
local packed = Codec.Encode(cleanOutfit)
local outfit = Codec.Decode(packed)
print(buffer.len(packed))
```

Encode expects an already validated outfit. Decode reconstructs Roblox Color3/Vector3
values, but callers must still run Validation.Clean before applying a saved outfit.
Accessory Type is intentionally omitted and derived from catalog or mesh data during validation.

## Version 4


Fields are written in the following order:
```text
3 bytes   "ECO" signature
1 byte    buffer format version (currently 4)
3 bytes   skin RGB
1 byte    body transparency
24 bytes  six body scales, as float32
4 bytes   asset-slot presence mask
variable  IDs for occupied slots only
1 byte    body-override count
variable  body overrides
1 byte    accessory count
variable  ordered accessory records
1 byte    identity presence (versions 3 and 4)
variable  roleplay name and bio, when present
```

The six scale slots are Height, Width, Depth, Head, BodyType and Proportion. Eclipse no
longer uses BodyType and Proportion, but their slots stay so the layout and older saves
are unchanged: they are written as 0 and ignored when read.

The 17 slot indexes, 20 body-override indexes and 16 attachment indexes are explicitly
listed in the module. These lists define version 1. Never sort or reorder them.
HumanoidRootPart is attachment index 16. Body overrides include the R15 parts plus
the legacy Torso/LeftArm/RightArm/LeftLeg/RightLeg group entries.

## Variable Integers


An asset ID is written in groups of seven bits. The high bit marks another byte.
Small IDs occupy fewer bytes; current large catalog IDs remain exact.
The supported integer range is 0 through 2^53 - 1. Asset IDs are not stored as float32.
Texture ID 0 is valid because it means explicitly remove the texture.

## Body Overrides


Each override stores its part/group index and a presence byte:
```text
bit 0: color exists (RGB, three bytes)
bit 1: transparency exists (one byte)
```

A missing property is different from a property set to zero. Both forms survive encoding.
Missing overrides inherit the normal body/group behavior after decoding.

## Accessories


Each record has a variable asset ID, a presence byte, then only the marked fields:
```text
bit 0: position (three float32 values)
bit 1: rotation in degrees (three float32 values)
bit 2: scale (three float32 values)
bit 3: color (RGB bytes)
bit 4: texture ID (variable integer, including zero)
bit 5: material name (one-byte length followed by UTF-8 bytes)
bit 6: attachment index (one byte)
```

Default position/rotation are zero; default scale is one. Those vectors are omitted
when each component is within 0.000001 of its default. The decoder restores defaults.
nil color/material/attachment/texture remains nil; no override is introduced.

## Version-2 Accessory Extensions


After each original accessory record, a second presence byte contains:
```text
bit 0: custom Name (one-byte length and UTF-8 text, up to 40 bytes)
bit 1: MeshId (variable integer), Key (text up to 40 bytes), MeshSize (three float32)
bit 2: accessory Transparency (one byte)
```

MeshSize is the absolute base size; Scale remains the editable multiplier.
Key identifies each mesh copy independently of AssetId or MeshId.
Version-1 records have no extension byte and remain readable.

## Identity In Versions 3 And 4


After the last accessory, a presence byte says which of the roleplay name (bit 0) and bio
(bit 1) follow. Version 4 writes each present field as a two-byte unsigned length followed
by its UTF-8 bytes. The codec caps each field at 4096 bytes; normal validation uses the
separate Configuration.Identity limits, currently 30 bytes for a name and 250 for a bio.

Version 3 used one-byte lengths, up to 255 bytes per field. Its reader remains available.
Version-1 and version-2 saves have no identity and load with none.

## Precision


Color and transparency channels are rounded to 0–255. The maximum channel rounding
error is half of 1/255. Transform and scale values use float32, so tiny rounding changes
are expected. IDs use exact integer encoding and do not lose precision.

This is deliberately simpler than a general compression framework. There is no shared
dictionary, quantized transform packing, checksum, export alphabet or custom compressor.
Native buffers are stored directly in DataStores; do not convert arbitrary buffer bytes
into a DataStore string. Raw binary may not be valid UTF-8.

## Limits And Validation


The codec supports at most 255 accessory records and 16,384 bytes per outfit. Normal
validation allows 50 rigid accessories and 6 layered clothing items by default; the
Paragon importer converts at most 64 source records. These are separate limits.
Increasing avatar limits must still respect the codec's count and total byte caps.
Material names are limited to 32 bytes; accessory names and mesh keys to 40 bytes. Scalars must be finite; decoded floats
must also be within a generous bounded range before normal appearance validation.

The reader checks the signature, version, masks, indexes, counts, integer ranges,
finite floats, short-text encoding, truncated data and trailing bytes. Unsupported
versions fail instead of silently producing a blank outfit.

## Versioning


Schema.Version describes the runtime outfit table; OutfitBuffer.Version describes
the binary layout. They are separate. Decode starts from Schema.Default, supplying
runtime defaults before restoring the saved fields.

Changing stored field order, widths or indexes requires a NEW binary version.
Keep the old reader when introducing a new writer, or deliberately migrate old saves.
The version-4 writer has readers for versions 1, 2, 3 and 4. Unknown future fields are not preserved.
When adding a new persisted asset slot, update the codec as well as Schema.AssetSlots.

## Size Example


An earlier version-1 test outfit with two accessories, a large asset ID, an HRP attachment, a transformed
accessory, a deleted texture and body overrides used 121 buffer bytes versus 797 bytes
for a comparable JSON table. That is a raw serialization comparison, not a measurement
of DataStore's compressed backend size. More populated outfits have different ratios.

## Math Helpers


The codec uses Packages.math.IsFinite for number checks and NearlyEqual for default
vector detection. Libraries.check uses the same finite checks; sliders use Normalize
and MapRange; body appearance comparisons use NearlyEqual. The math module remains
the shared implementation rather than duplicating those calculations.
