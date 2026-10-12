# Interface


The interface is stored as UI instances in ReplicatedStorage.Eclipse.Interface.Assets.

Customization is the complete editor ScreenGui. Its Window contains Editor, Properties
and Preview. Editor.Pages contains the Body, Clothing, Accessories, Animations, Identity and
Outfits pages, and Editor.Categories has a matching tab button for each.
EclipseTransition is the separate screen used while entering and leaving the editor.
Templates.AccessoryRow is the row cloned for each worn accessory.
Templates.OutfitRow is the saved outfit list row. Window.OutfitPreview contains the large
saved avatar viewport. The Outfits page includes NameInput, SaveCurrent, Actions and Items.
The Identity page includes NameInput, BioInput and their NameCount and BioCount labels.

Three more screens belong to names and bios (guide 15). CharacterSheet is the sheet window;
its Window.Content holds RoleplayName, Username, Height, Rule and Bio. NameCard is the
small card shown beside the cursor over another player, with Card.Title, Card.Prompt and
a Highlight for the outline. Templates.NameTag is the BillboardGui cloned onto each head.
Avoid naming a control "Name": that is already a property on every instance, so the
scripts couldn't find it by name.

Edit those instances in Studio to change labels, spacing, colors, gradients and layout.
The color wheel's bands and the R15 diagram are stored there too. The component modules
bind events and update existing controls. The tab modules bind each page to OutfitState.

At startup, app clones the two stored screens into PlayerGui. Accessory rows clone the
stored row template. No Eclipse module constructs the UI hierarchy at runtime.

Keep names used by the bindings intact when moving or duplicating controls. Asset fields
use the slot key followed by Asset, for example ShirtAsset or LeftArmAsset. The body
scale rows are Height (with Feet and Inches boxes), Width, Depth and HeadScale (each with
an Input box), and each row has a Value label showing the current reading. HeadScale is
the head-size row; HeadAsset is the body-asset field.

## Theme


Core.theme remains the shared palette and font configuration. Core.styling applies
Theme_PROPERTY attributes on the UI instances, such as Theme_BackgroundColor3 = Surface
or Theme_FontFace = Medium. Remove a theme attribute when an instance should use its
own edited property instead. Dynamic states such as selection still use theme tokens.

The Customization screen has responsive layout attributes: CompactWidth, EditorWidthScale,
EditorMinWidth, EditorMaxWidth and InspectorWidth. The layout controller reads those
attributes when the viewport changes size. Individual control layouts stay in the assets.

## Testing Changes


Playtest opening, each tab, item selection, the color wheel, viewport zoom, transforms,
attachment choices and closing. Changes made to PlayerGui during Play are temporary;
edit the stored Assets screens in Edit mode for lasting changes.
