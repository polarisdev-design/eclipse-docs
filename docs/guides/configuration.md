# Configuration

Most settings are in `ReplicatedStorage.Eclipse.Config.configuration`. Change the rules there rather than editing the validator.

| Setting | What it changes |
| --- | --- |
| MaxAccessories | Rigid accessory count; default 50 |
| AllowLayeredClothing | Whether players can wear layered clothing |
| MaxLayeredClothing | Layered clothing count; default 6 |
| AccessoryTypes | Allowed catalog accessory types |
| BlockedAssets | IDs players cannot use |
| AccessoryOffset | Maximum movement from an item's base position |
| AccessoryRotation | Rotation range in degrees |
| AccessoryScale | Minimum and maximum size multipliers |
| Height | Base height and allowed heights in inches |
| Scale | Width, depth and head ranges |
| Outfits | Save slots, outfit-name length and DataStore name |
| Identity | Name and bio lengths, change rate and display distances |

These rules also apply to outfits submitted through the server API.

## Height

Height is converted to a scale using:

```lua
HeightScale = Inches / Configuration.Height.BaseInches
```

The current base is 62.7262 inches. The default range is 28 to 107 inches. For example, six feet is 72 inches.

BodyType and Proportion are not fields in the outfit's Scale table. Applying a description preserves the values already on the character.

## Camera and UI

Use `Config.camera` for zoom, orbit, pan, smoothing and key bindings. Space resets the editor camera.

Edit `Interface.Assets` for the layout and `Interface.Core.theme` for colors. The [interface guide](/guides/interface) lists the assets.

## Storage limits

Increasing an accessory limit doesn't increase the size of the save buffer. The avatar, importer and codec have separate caps, listed in [formats and limits](/reference/versions).
