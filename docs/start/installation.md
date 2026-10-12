# Installation

These instructions install the existing Eclipse package. The documentation website does not include the Roblox model itself.

## Place the package

Keep these two roots and all their descendants together:

```text
ReplicatedStorage
  Eclipse (ModuleScript)
    Runtime (Script, RunContext = Client)
    Core, Controllers, Config, Data, Helpers
    Interface, Libraries, Packages, Remotes, Docs
    license
ServerScriptService
  Eclipse (ModuleScript)
    Server (Script)
    Services
    Modules
```

Import both roots from your Eclipse distribution. Preserve module names, attributes, remotes and stored UI templates. The Runtime and Server scripts start their respective framework instances; no additional starter script is needed.

## Check the remotes

The package should already contain these instances. If assembling it manually, create them in Studio:

```text
ReplicatedStorage.Eclipse.Remotes.Customization
  GetOutfit     RemoteFunction
  ApplyOutfit   RemoteEvent
  OutfitApplied RemoteEvent
```

## Configure the experience

- Set the avatar rig to R15.
- Confirm Runtime has RunContext set to Client.
- Configure permitted assets and limits in Config.configuration.
- For saved-outfit testing in Studio, enable Studio access to API services in a suitable test experience. The storage module uses a separate Studio store suffix.
- Replace or authorize the CustomizationIdle animation for your experience if its asset permissions require it.

## Verify installation

Start a playtest. Open the avatar icon, edit an accessory, and close the editor. Movement and the camera should restore. Test save/load explicitly and use a two-client session to check identity filtering and character sheets.

Read [Configuration](/guides/configuration) next. See [Introduction](/learn/introduction) for the full hierarchy.
