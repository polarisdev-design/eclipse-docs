# Outfits


Saved outfits are named snapshots. Players explicitly save, load, rename, overwrite or
delete them in the Outfits tab. Joining still uses the normal starting Roblox avatar.
There is no last-worn field, no automatic outfit restoration and no save on every edit.

## What Is Saved


The complete Eclipse outfit: skin color, body transparency and per-part overrides,
body scales and assets, classic/layered clothing, animations and accessory order.
Accessory records include position, rotation, scale, color, texture, material and
attachment part, including HumanoidRootPart. nil texture means original; 0 means deleted.
The roleplay name and bio are saved too, so loading an outfit brings them back (guide 15).
The temporary customization idle pose and camera/UI state are not part of a saved outfit.

## Where The Code Lives


ServerScriptService.Eclipse.Services.outfits       validates and handles requests
ServerScriptService.Eclipse.Modules.storage    reads/writes named records
ReplicatedStorage.Eclipse.Data.buffer        compact binary encoding (guide 12)
ReplicatedStorage.Eclipse.Interface.Tabs.outfits    binds the saved outfit UI
ReplicatedStorage.Eclipse.Interface.Helpers.avatar
```lua
											builds a local preview avatar
```

The framework discovers Services.outfits. Helpers and the codec are required directly.
UI controls are saved instances: Editor.Pages.Outfits, Window.OutfitPreview and
Assets.Templates.OutfitRow. Runtime code clones/binds them rather than constructing UI.

## Settings


Config.configuration.Outfits contains:
```text
MaxOutfits = 20
MaxNameLength = 32
StoreName = "EclipseOutfits_v1"
```

The default store appends "_Studio" during Studio tests to keep test records separate.
Studio API access must be enabled for those tests. Published servers use the base name.
Store keys are Player_&lt;UserId&gt;; a player can only request their own collection.
Changing StoreName selects a different collection; it does not migrate existing saves.

## The Save Flow


1. The client copies its current draft at the moment Save or Overwrite is pressed.
This avoids capturing an older outfit from a delayed appearance acknowledgment.
2. The server validates that snapshot with the existing asset/type/range rules.
3. Data.buffer encodes the clean outfit to a native buffer.
4. storage writes the operation with UpdateAsync.
5. The UI says "Outfit saved" only after the operation has been confirmed.

Save creates a fresh GUID. Overwrite changes the data of the selected GUID.
Rename changes its filtered name. Delete removes that GUID.
Overwrite and Delete require a second click within five seconds in the UI.
Rename uses the name textbox; Enter in that textbox saves a NEW outfit.
Names pass the existing broadcast text filter and fail closed if filtering fails.

## The Load Flow


The server reads the selected record, checks its revision, decodes it and validates it
again against today's rules. The saved outfit is then applied through Services.service.
ApplySavedOutfit waits for the apply and returns the accepted outfit to the client.
The client cancels queued draft sends and replaces its local copy with that answer.
Loading does not write a last-worn preference or change the player's starting avatar.
If a catalog item is no longer available or allowed, validation can omit it from the
applied appearance. The stored snapshot stays unchanged until an explicit Overwrite.

## Storage Record


```text
{
	Version = 1,
	Entries = {
		[Guid] = {
			Name = "Filtered name",
			Revision = 1,
			CreatedAt = UnixSeconds,
			UpdatedAt = UnixSeconds,
			Data = NativeOutfitBuffer,
		},
	},
	Operations = { ...last 32 operation IDs... },
}
```

List requests return metadata: ID, name, revision, dates, accessory count, byte size
and a corrupt-data flag. They do not download every outfit's complete appearance.
Selecting an entry requests a decoded preview. Loading requests that specific entry.

## Concurrent Writes And Failures


Every mutation is applied to the latest record inside UpdateAsync. There is no dirty
whole-profile cache to overwrite another server's work, and no deferred leave/shutdown
save queue. Successful explicit operations are already stored before their reply.

Rename, Overwrite, Delete, Preview and Load carry the entry's expected Revision.
A stale selection is rejected and the player is asked to refresh. Unrelated entries
remain intact. Each mutation increments that entry's Revision.

One request runs per player at a time, with separate request/write rate limits.
Each write has a stable operation ID across retries. A committed write whose response
was lost is recognized by that ID, preventing duplicate saves or revision increments.
After retries fail, an uncached read checks whether the operation actually committed.
An unconfirmed result is reported as unconfirmed; the player should refresh first.

Failed reads, unknown record versions or malformed record envelopes never become
an empty collection that is then written back. A corrupt outfit buffer is marked in
the list and cannot be loaded; the player can deliberately delete or overwrite it.
There is no session lock here because operations update the current stored record
atomically, rather than saving a session's cached whole collection.

## The Existing Remote


GetOutfit remains a RemoteFunction. Its original call with no arguments still returns
the current appearance. The saved outfit route uses:

```text
GetOutfit:InvokeServer("SavedOutfits", Action, Payload)
```

Actions: List, Preview, Save, Load, Rename, Overwrite, Delete.
No new RemoteEvents are needed. IDs and revisions always come from the server's list.
Save/Overwrite payloads include Outfit; Save/Rename include Name.

## Server Integration


```lua
local Eclipse = require(game:GetService("ServerScriptService").Eclipse)
local result = Eclipse.ListOutfits(player)
local outfit = Eclipse.GetOutfit(player)
local saved = Eclipse.SaveOutfit(player, "My outfit", outfit)

Eclipse.LoadOutfit(player, entry.Id, entry.Revision)
Eclipse.ManageOutfit(player, "Rename", {
	Id = entry.Id, Revision = entry.Revision, Name = "New name",
})
```

Each returns a result table with Ok and Message; successful list/write results include
Entries and Maximum. Successful loads include the accepted Outfit.
ManageOutfit also supports Overwrite and Delete.

For an existing player-data system, Eclipse.UseOutfitStorage(driver) may be called before
the first saved outfit request. The driver implements GetAsync(key, options) and
UpdateAsync(key, transform). It must preserve atomic callback behavior and native buffers.
The transform can run more than once and cannot yield. This hook does not automatically
integrate a particular profile library; the host game owns that adapter.

## Checking It


Test save, rename, overwrite, delete and refresh; then stop and rejoin to verify records
persist while the starting appearance stays unchanged. Test accessory transform, texture
deletion, HRP attachment and per-part transparency round trips. Simulate failed reads,
stale revisions and a write that commits before throwing an error.
