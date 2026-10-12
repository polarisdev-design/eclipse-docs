# Introduction


Welcome to the Eclipse docs. These modules are only comments. Nothing requires them and they
never run, so you can read them, move them or delete the whole Docs folder without breaking
anything.

## What Eclipse Is


Eclipse is an avatar editor library for R15 roleplay games, by Polaris.

## Where Everything Is


ReplicatedStorage.Eclipse            shared code, plus the client editor
```text
Runtime                          the client script that starts the editor
Config                           settings you are meant to change
	configuration                what players can wear, the limits and saved outfits
	camera                       how the editor camera feels
Core
	framework                    starts modules in order (guide 02)
	ignition                     an alias for framework, for older integrations
Controllers                      client modules the framework starts
Data
	schema                       the shape of an outfit (guide 03)
	serializer                   outfit <-> HumanoidDescription (guide 03)
	buffer                       compact saved outfits (guide 12)
Helpers
	body                         body scale, colors and transparency (guide 06)
	welding                      placing and restyling accessories (guide 05)
	mesh                         imported mesh accessories (guides 03 and 14)
Interface                        the client editor
	Assets                       the editor's stored UI instances (guide 10)
	State.outfit                 the client's copy of the outfit (guide 09)
	Helpers.handles              3D handles (guide 08)
	Helpers.camera, environment,
	movement, pose               the editor scene (guide 07)
	Helpers.avatar               saved outfit previews (guide 13)
	Tabs.outfits                 the saved outfits tab (guide 13)
	Components.importer          the import controls (guide 14)
	Tabs.identity, Screens.sheet,
	Helpers.nametags             names, bios, sheets and name tags (guide 15)
Controllers.identity             starts the sheets and name tags (guide 15)
Libraries                        small general purpose tools
Packages                         third party code (Signal, Trove, TopbarPlus) and math
Remotes.Customization            the RemoteEvents and RemoteFunction
Docs                             these guides
```

ServerScriptService.Eclipse          the public server API (guide 11)
```text
Server                           the server script that starts everything
Services
	service                      owns every player's outfit (guide 06)
	outfits                      named outfit saving (guide 13)
	outfits.importer             import review and apply requests (guide 14)
Modules
	validation                   cleans outfits sent by clients (guide 04)
	tags                         matches worn accessories to asset ids (guide 05)
	storage                      reads and writes saved outfits (guide 13)
	importer                     converts transfer codes (guide 14)
	identity                     filters names and bios (guide 15)
	filter                       text filtering for names, bios and outfit names
```

## Building Order


The guides follow the order in which you would create the system, starting with its
engine foundations and shared modules, then connecting the server and client.

```text
00 Introduction    hierarchy, settings and this build order
01 Avatars         the Roblox rig and appearance pieces
02 Framework       startup and module registration
03 Schema          the outfit data and serialization contract
04 Validation      permitted assets and server trust
05 Welding         accessory placement and appearance helpers
06 Applying        server outfit sessions and character application
07 Scene           camera, environment and movement
08 Handles         transform interaction
09 State           the client's outfit and server synchronization
10 Interface       stored UI instances and component bindings
11 Integration     public API and adding features
12 Buffer          compact storage encoding
13 Outfits         named saves built on the codec and appearance service
14 Importing       normal Paragon transfer imports
15 Identity        roleplay names, bios, name tags and character sheets
16 Lessons         bugs encountered during development
17 Glossary        reference terms
```

Read 12 before 13: the storage service needs the codec. Read 13 before 14:
the import flow uses its request route, UI and application path. Read 03, 04 and 09
before 15: names and bios are part of the outfit.

## Changing Settings


Most games only ever need to edit Config.configuration:

```text
MaxAccessories          how many hats, hair and other rigid accessories one player can wear
AllowLayeredClothing    whether 3D clothing (jackets, shoes) is allowed at all
MaxLayeredClothing      how many layered clothing items one player can wear
AccessoryTypes          which accessory types are allowed. Remove a line to ban a type
BlockedAssets           asset ids nobody can wear
Height                  the tallest and shortest a player can be, in inches
Scale                   the smallest and largest width, depth and head scale
AccessoryOffset         how far (studs) an accessory can be moved from its normal spot
AccessoryRotation       how far (degrees) it can be rotated on each axis
AccessoryScale          the smallest and largest size multiplier
Outfits.MaxOutfits      how many named outfits each player can save
Outfits.MaxNameLength   the longest outfit name allowed
Outfits.StoreName       the DataStore saved outfits use (guide 13)
Identity                name and bio lengths, how often they can change, and the
                        name tag and sheet distances (guide 15)
```

The server enforces these, so changing them changes what is allowed for everyone, and a
player can't get around them by sending their own data.

Config.camera controls the editor camera: zoom range, orbit and pan speed, smoothing, and
the keys for moving up, moving down and recentring.

## Game Settings Eclipse Needs


- Avatar type must be R15 (Game Settings &gt; Avatar). On R6 characters the server raises an
  error and leaves the character alone.
- Nothing goes in StarterPlayerScripts or StarterCharacterScripts. The client starts from
  ReplicatedStorage.Eclipse.Runtime, a Script whose RunContext is Client.

## Credits


Eclipse by Polaris is distributed under the custom licence in ReplicatedStorage.Eclipse.license.
Copyright (c) 2026 Polaris. It permits use, copying and modification for your own Roblox
experiences, including experiences that earn revenue, and sharing with your development
team. Keep the copyright and permission notices with copies or substantial portions.

The licence restricts selling, sublicensing, publishing or redistributing Eclipse or
modified versions as standalone products or resources, including models, plugins, kits,
reposts and uncopylocked places. Publishing a playable experience that players cannot
copy is permitted. Read the license module for the full terms.

Signal and Trove retain their MIT licences; TopbarPlus retains MPL 2.0. Their notices are
in Packages.licenses.
