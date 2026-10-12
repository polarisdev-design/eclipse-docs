# Client and framework API

```lua
local Eclipse = require(game:GetService("ReplicatedStorage").Eclipse)
```

Runtime starts the client controllers. You normally don't need another startup script.

| Method | Behavior |
| --- | --- |
| Start() | Starts the controllers; repeated calls share the same startup |
| Get(name) | Returns a registered module by short name or full instance path; errors if missing |
| IsReady() | Returns true once startup finishes |
| AwaitReady() | Waits for startup and raises its error if it fails; call after Start |

## Adding a controller

The framework loads direct ModuleScript children of its supplied containers. Helpers below those modules are required by their owners.

Return a table from the module. Add Init for initialization and Start for connections or other startup work.

All Init calls finish before ordinary Start calls run. Each Start has its own task, so it should set up the module and return.

## Ordering

| Attribute | Effect |
| --- | --- |
| Preload | Requires and initializes the module before ordinary modules |
| LoadOrder | First numeric sort order |
| OrganizationOrder | Second numeric sort order |
| Disabled | Skips the module when true |

Get retrieves modules; it does not open the editor.

[Framework](/learn/framework) has a worked example. [State](/learn/state) explains how the editor's outfit copy is synchronized.
