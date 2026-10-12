# Framework


What you'll learn: how Eclipse starts its code on the client and the server, and how to
control the order modules start in.

## The Idea


A game with many modules needs them to start in a sensible order. A module that sets up
the remotes must be ready before a module that uses them. Framework solves this with two
steps for every module:

```text
Init    set yourself up. Don't use other modules yet
Start   everything is set up now, so use whatever you need
```

Framework requires every module, runs every Init, and only when all of them have finished
does it run any Start. So by the time any Start runs, every module has finished its Init.
A module can leave out either function.

## Where It Lives


```text
ReplicatedStorage.Eclipse.Core.framework       the loader
ReplicatedStorage.Eclipse.Runtime             client Script: calls Eclipse.Start()
ReplicatedStorage.Eclipse (module)            Eclipse.Start starts the Controllers folder
ServerScriptService.Eclipse.Server            server Script: starts the Services folder
```

The client starts from Runtime, a Script with its RunContext set to Client. A Script set to
the Client run context runs on every player's device even though it lives in
ReplicatedStorage, so Eclipse needs nothing in StarterPlayerScripts.

```lua
local Eclipse = require(RS.Eclipse)
Eclipse.Start()
```

The server's Server script does the same with the Services folder, through
ServerScriptService.Eclipse:

```lua
local Eclipse = require(script.Parent)
Eclipse.Start()
```

Calling Start more than once is safe: later calls share the same startup.

Modules the loader starts are called controllers on the client and services on the server.
Eclipse has one controller, Controllers.customizer (which hands Framework the editor's app
module), and two services: Services.service and Services.outfits.

## Order


Framework:Start takes a list of folders (or single modules). It collects every ModuleScript
directly inside them and sorts them by attributes you set in the Properties window:

```text
Preload (true)              loads and inits before everything else
LoadOrder (number)          lower numbers go first. Modules without one count as 0
OrganizationOrder (number)  a second number for grouping within the same LoadOrder
Disabled (true)             skipped entirely
```

Ties are broken by full name, so the order is the same on every run.

```lua
table.sort(candidates, function(left, right)
	if left.Preload ~= right.Preload then
		return left.Preload
	end
	if left.LoadOrder ~= right.LoadOrder then
		return left.LoadOrder < right.LoadOrder
	end
	if left.OrganizationOrder ~= right.OrganizationOrder then
		return left.OrganizationOrder < right.OrganizationOrder
	end
	return left.Name < right.Name
end)
```

A Preload module runs its Init as soon as it is required, before the ordinary modules are
even required. Use it for things the others need while they load.

Every Start runs in its own thread (task.spawn), so a Start that yields or loops forever
can't hold up the others. Init is not spawned: a slow Init delays every module after it.

## Errors


Framework doesn't hide errors, but it treats the two halves of startup differently.

- Loading and Init: if a module fails to load, returns something other than a table, has a
  LoadOrder that isn't a number, or its Init errors, startup stops there. The status
  becomes Failed and the error is raised with its full traceback. Calling Start again after
  that raises the same error instead of trying again.
- Start: each Start runs in its own thread, so an error there can't stop the others. It is
  caught, printed as a warning with its traceback, and the status becomes Failed, so
  AwaitReady raises it.

Every lifecycle module is registered by its name, so two modules with the same name in
Services or Controllers raise an error. Give each one a unique name.

## A Worked Example


Add a ModuleScript called "welcome" to ServerScriptService.Eclipse.Services:

```lua
local Players = game:GetService("Players")

local Welcome = {}

function Welcome.Init()
	print("welcome: init")
end

function Welcome.Start()
	Players.PlayerAdded:Connect(function(player)
		print("welcome,", player.Name)
	end)
end

return Welcome
```

Framework picks it up automatically. Give it a LoadOrder of -1 to make it start before
service.

## Common Mistakes


- Using another module inside Init. It may not be set up yet. Do that in Start.
- Yielding in Init (a WaitForChild that never finishes, a web call). Everything after it
  waits.
- Putting a module in a subfolder of Services or Controllers. Only direct children are
  loaded.
- Calling AwaitReady inside a managed Init or Start. That module's own Start has to
  finish before startup is ready, so it waits forever.

## The Framework Api


The client and the server each have their own registry and startup state.

```text
Eclipse.Start()           starts Controllers on the client, Services on the server
Eclipse.Get(name)         a registered module, by name ("service", "customizer")
Eclipse.IsReady()         true once every Start has returned
Eclipse.AwaitReady()      yields until startup is done, or raises the startup error
```

Core.framework:GetStatus() returns Idle, Starting, Ready or Failed.

Call AwaitReady from your own integration code after Eclipse.Start(). Start methods should
connect events and launch background tasks, then return. LoadOrder controls the order
modules launch in; it doesn't wait for another module's Start to finish.

Only lifecycle modules (the direct children of Services and Controllers) are registered.
Require helper modules directly. Core.ignition is kept as an alias for framework, so older
integrations that require it still work.
