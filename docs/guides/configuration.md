# Configuration

Edit ReplicatedStorage.Eclipse.Config.configuration. The server validates client and server outfits against the same rules.

| Setting | Purpose |
| --- | --- |
| MaxAccessories | Rigid accessory limit; default 50 |
| AllowLayeredClothing / MaxLayeredClothing | Enable and limit layered clothing; default 6 |
| AccessoryTypes | Permitted catalog accessory types |
| BlockedAssets | Asset IDs disallowed by the experience |
| AccessoryOffset / AccessoryRotation / AccessoryScale | Transform bounds |
| Height | Base height and permitted minimum/maximum, in inches |
| Scale | Width, depth and head ranges |
| Outfits | Save slots, outfit-name limit and DataStore name |
| Identity | Text limits, change rate, tag and sheet distances |

## Height

HeightScale equals desired inches divided by Height.BaseInches. The current base is 62.7262 inches, with permitted heights from 28 to 107 inches.

BodyType and Proportion are not editable runtime outfit fields. Description application preserves the character's existing values.

## Camera

Config.camera controls orbit, zoom, pan, smoothing and input keys. Space resets the camera. Edit saved UI instances for layout changes.

## Different limits

Avatar limits, import limits and codec capacities are separate. See [formats and limits](/reference/versions).
