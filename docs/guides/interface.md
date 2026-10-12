# Interface

The UI is stored under `ReplicatedStorage.Eclipse.Interface.Assets`. Edit those instances in Studio; the component modules connect them to the editor.

| Asset | Used for |
| --- | --- |
| Customization | Editor pages, accessory inspector and focus toolbar |
| EclipseTransition | Entering and leaving the editor |
| CharacterSheet | Roleplay name, username, height and bio |
| NameCard | The card shown when hovering another player |
| Templates | Accessory rows, outfit rows and name tags |
| CustomizationIdle | The animation played while editing |

## Changing the layout

Keep the names the binders use. Moving a field or changing its name may also require changing the module that binds it.

Colors are in `Interface.Core.theme`. The styling module applies them when an asset is cloned.

See [Interface](/learn/interface) for the expected instance layout.

## Body scaling

When a player edits their body scale, Eclipse refits accessories so they keep their offset from the holding part's center and their size relative to that part.

Loading a save, importing an outfit or applying one from a server script uses the submitted transforms directly.

## Check your changes

Select an accessory, move it, switch to focus mode, then return to the editor. Close and reopen it.

Also check the compact layout and make sure zooming an accessory viewport doesn't scroll its sidebar. If you change a character's head, check that its name tag returns.

[Handles](/learn/handles) covers transform controls. [Scene](/learn/scene) covers the camera and editor environment.
