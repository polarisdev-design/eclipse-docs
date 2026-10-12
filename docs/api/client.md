# Client and framework API

Require ReplicatedStorage.Eclipse on the client. Runtime normally calls Start for you.

| Method | Contract |
| --- | --- |
| Start() | Starts registered client controllers; repeated root startup calls share the framework startup |
| Get(name) | Gets a registered module by its short name or full instance path; errors if absent |
| IsReady() | Returns whether startup completed successfully |
| AwaitReady() | Waits for startup and propagates failure; call after Start |

## Registration

The loader discovers direct ModuleScript children of supplied containers. It does not recursively start every helper.

Attributes control discovery and order:

| Attribute | Meaning |
| --- | --- |
| Preload | Require and initialize before ordinary modules |
| LoadOrder | Primary numeric order |
| OrganizationOrder | Secondary numeric order |
| Disabled | Skip when true |

Modules return tables. Init runs before Start, and each Start runs in its own task. Start should establish connections and return rather than run an endless loop.

Eclipse.Get is module access, not a generic editor-open function. Internal UI components and helpers are explained in Learn and may change as implementation evolves.

See [Framework](/learn/framework) and [State](/learn/state).
