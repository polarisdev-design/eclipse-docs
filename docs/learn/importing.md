# Importing


Create this after the outfit editor, buffer codec and saved outfit service. The importer
uses their existing data, validation, application and UI lifecycle.

## Supported Codes


Use Paragon's NORMAL outfit Export code. Eclipse reads uncompressed transfer versions
6, 8, 9, 10, 11 and 12, plus the version-13 raw-DEFLATE wrapper used by the current exporter.
Whitespace around and inside copied Base64 is accepted.

PRG1 portable exports are deliberately rejected. Bare accessory-list codes are rejected.
Old version-4 transfers and unknown versions must be re-exported from current Paragon.
No Paragon DataStore, saved slot, account or running server is consulted by the importer:
the normal transfer code contains the outfit snapshot itself.

## Create The Modules


ReplicatedStorage.Eclipse.Helpers.mesh creates and reconciles raw mesh accessories.

ServerScriptService.Eclipse.Modules.importer
```text
decoder       parses the normal transfer format
inflate       reads the bounded compressed wrapper
```

ServerScriptService.Eclipse.Services.outfits.importer
```text
validates review requests, filters the name and owns temporary review tokens
```

ReplicatedStorage.Eclipse.Interface.Components.importer
```text
binds the stored import controls on the Outfits page
```

All these module names are one word. Services.outfits routes ImportReview/ImportApply to
its child handler. They share the existing GetOutfit RemoteFunction and player request
lock. The importer has its own two-reviews-per-15-seconds limit.

## Conversion


The decoder reads body assets, catalog clothing, body scales, six skin-color groups,
individual body transparency, animation IDs and the ordered accessory records.
The converter produces the same Eclipse outfit table used everywhere else.

For converted catalog meshes, catalogId supplies the original catalog accessory.
When no usable catalog origin exists, assetId is loaded as a mesh through AssetService.
The mesh keeps its exported name, absolute base size, texture, color, material and
transparency. Like Paragon, insertion supplies a handle attachment before AddAccessory,
then restores the saved size and body-relative pose. This prevents an extra head weld
from competing with the saved body attachment. Each copy receives a separate Key, so repeated mesh IDs remain editable.
Blocked assets and configured accessory limits still apply; inaccessible meshes are reported.

Paragon stores handle size and a body-relative pose. Eclipse stores scale multipliers
and transform offsets. Conversion builds a temporary R15 model with the validated
body/scale/asset choices, reads each original handle size and computes the size ratio.
The body-relative pose becomes an explicit attachment target, position and rotation.
Preview rigs remain in ReplicatedStorage and resolve their rest pose from body joints;
only the viewport copy renders. Preview rigs are never placed under the scene camera.
Old attachment-offset records and source-attachment-space records are resolved in their
correct coordinate spaces before conversion. The temporary model is destroyed.

Validation runs again after pose conversion. Positions, rotations, sizes and body scales
outside Eclipse's configured limits are clamped and included in the review notices.
Asset IDs stay exact; angles convert from radians to degrees using Packages.math.

## Compatibility Notices


The review reports meshes that cannot load and entries omitted by configured limits.
Repeated catalog records use the source mesh fallback when available.
The roleplay name and bio are imported, and filtered when the import is applied.
Eclipse does not import direct clothing/face image overrides, accessory groups,
particles, custom rig modes or name fonts and colors.
Accessory names are preserved as encoded; names clipped by Paragon cannot be recovered.
Sit/swim-idle tracks have no Eclipse slots. Animation IDs that don't match the catalog
type required by a slot are omitted and reported.

Those limitations are shown before applying. They are not silently saved as if preserved.
The Eclipse buffer writes version 4, which keeps mesh data, custom names and the
roleplay name and bio with two-byte text lengths. Existing version-1, version-2 and
version-3 saves remain readable.

## Review, Then Apply


1. In the Outfits tab, open Import Paragon outfit and paste the normal transfer code.
2. Review code converts and validates it without changing the worn character.
3. A separate preview and compatibility summary show the result.
4. Apply import uses the server's reviewed snapshot and updates the current outfit.
5. Save current outfit explicitly creates a named Eclipse save if the player wants it.

An import does not create a DataStore record automatically. Joining still uses the
normal Roblox avatar. Editing the pasted code invalidates the client review.
Cancel review discards that client selection. A new review replaces the previous
server candidate; unused candidates expire after two minutes or when the player leaves.

The apply token is random, bound to that player, single-use and time-limited. The server
does not accept an arbitrary client-supplied converted outfit as the reviewed result.
Loading/applied-import responses cancel queued client draft sends and replace the local
outfit with the accepted server snapshot.

## Server Api


```lua
local review = Eclipse.ManageOutfit(player, "ImportReview", { Code = code })
if review.Ok then
	-- present review.Warnings and review.Preview before applying
	local applied = Eclipse.ManageOutfit(player, "ImportApply", {
		Token = review.Token,
	})
end
```

Review includes Token, Name, Preview, Warnings, Imported, Omitted, Adjusted and Version.
Apply includes the accepted Outfit and filtered Name. No new remotes are required.

## Ui Instances


Editor.Pages.Outfits.ImportToggle opens ImportPanel.
ImportPanel contains CodeInput.Field.Box, Review, Warnings, Apply and Cancel.
Edit the saved instances under Interface.Assets.Customization in Studio.
The binding module creates no GUI objects.

## Defensive Reading


Text is capped at 131072 characters. Decompression stops before exceeding 524288 bytes.
The raw-DEFLATE reader handles stored, fixed-Huffman and dynamic-Huffman blocks, validates
back-references and rejects truncated streams and trailing bytes. The transfer reader
checks bounds, versions, kind, flags, strings, IDs, finite values and known extensions.
Labels clipped through a UTF-8 character by old exporters fall back to default text
and are reported in the review; appearance data remains readable.
Unsupported particle payloads are skipped within their declared bounded lengths, never
executed or deserialized into gameplay objects.

## Try It


1. In Paragon's customization space, open the outfit editor and press Export. Copy the
   code.
2. In a playtest of your game, open the editor, go to Outfits and choose Import Paragon
   outfit. Paste the code and press Review code.
3. Read the notices: anything that couldn't be imported is listed there.
4. Press Apply import and check the character matches. Then press Save current outfit and
   load it again to confirm it saved correctly.
5. Paste something that isn't a code, or a PRG1 code, and check it is refused with a clear
   message.

The compressed format the decompressor reads is raw DEFLATE, described in RFC 1951:
https://www.rfc-editor.org/rfc/rfc1951
