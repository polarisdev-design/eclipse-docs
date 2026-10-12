# Formats and compatibility

The runtime outfit schema and saved binary format have separate version numbers. The current snapshot uses **schema 4** and **buffer 4**.

| Buffer version | Stored additions |
| --- | --- |
| 1 | Body appearance, six scale slots, asset slots and accessory overrides |
| 2 | Accessory names, mesh IDs, separate keys, base mesh dimensions and transparency |
| 3 | Identity name and bio using one-byte text lengths |
| 4 | Identity text lengths use two bytes, with a 4096-byte codec limit per field |

The reader supports versions 1–4. BodyType and Proportion no longer appear in the runtime Scale table; their older binary slots remain and are ignored.

| Limit | Current value |
| --- | --- |
| Rigid accessories | 50 by default |
| Layered clothing | 6 by default |
| Paragon source records converted | 64 |
| Binary accessory records | 255 |
| Binary outfit size | 16,384 bytes |
| Identity name | 30 bytes by default |
| Identity bio | 250 bytes by default |
| Binary identity field | 4096 bytes |

The configured appearance limits apply before saving. The codec's larger capacities do not increase what players may wear.

See [the buffer guide](/learn/buffer) for the complete layout and [importing](/learn/importing) for normal Paragon transfer compatibility.
