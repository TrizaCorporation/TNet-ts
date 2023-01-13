import { Players, RunService } from "@rbxts/services"
import NetSignalConnection, { NetSignalConnectionType } from "./NetSignalConnection"
import { Middleware } from "./Types"

export interface NetSignalType {
    Middleware?: Middleware
    Connections: Array<NetSignalConnectionType>,
    HandleInboundRequest: Callback,
    Fire: Callback
}

class NetSignal {
    Middleware: Middleware
    Connections: Array<NetSignalConnectionType>
    PlayerRequestLimits: Map<Player, number>
    constructor(middleware: Middleware){
        this.Middleware = middleware? middleware : {}
        this.PlayerRequestLimits = new Map()
        this.Connections = []

        task.spawn(() => {
            while (task.wait(60)){
                if (this.Middleware.RequestsPerMinute){
                    for (const [player, _] of (this.PlayerRequestLimits)){
                        this.PlayerRequestLimits.set(player, this.Middleware.RequestsPerMinute)
                    }
                }
            }
        })
    }

    /**
     * Handles the specified function's Outbound Traffic.
     * @param {RemoteFunction | RemoteFunction} event The RemoteEvent/RemoteFunction you want to manage.
     * @param {unknown[]} args The args for the function
    */


    HandleOutboundRequest(event: RemoteEvent | RemoteFunction, ...args: unknown[]){
        if(this.Middleware.Outbound){
            for (const [_, handler] of pairs(this.Middleware.Outbound)){
                task.spawn(handler, event, ...args)
            }
        }
    }

    /**
     * Handles the specified function's Inbound Traffic.
     * @param {RemoteFunction | RemoteFunction} event The RemoteEvent/RemoteFunction you want to manage.
     * @param {unknown[]} args The args for the function
    */


    HandleInboundRequest(event: RemoteEvent | RemoteFunction, ...args: unknown[]){
        if (this.Middleware.Inbound){
            for (const [_, handler] of pairs(this.Middleware.Inbound)){
                task.spawn(handler, event, ...args)
            }
        }

        for (const [index, connection] of pairs(this.Connections)){
            if (connection.Callback){
                return connection.Callback(...args)
            }else{
                this.Connections.remove(index)
            }
        }
    }

    /**
     * Manage A Users Request Rate.
     * @param {Player} player The player you want to manage the RequestRate of.
    */

    HandleUserRequestRate(player: Player){
        if (!this.Middleware || !this.Middleware.RequestsPerMinute){
            return
        }
        const userRate = this.PlayerRequestLimits.get(player)
        if (userRate){
            const newRate = userRate - 1
            if (newRate <= 0){
                error("Rate Limit Reached.")
            }
            this.PlayerRequestLimits.set(player, newRate)
        }else{
            this.PlayerRequestLimits.set(player, this.Middleware.RequestsPerMinute - 1)
        }
    }

    /**
     * Lets you connect to the function to see when it's fired.
     * @param {Callback} callback The Callback for when the event is fired.
    */

    Connect(callback: Callback){
        let connection = new NetSignalConnection(callback)
        this.Connections.push(connection)
    }
}


export class NetSignalEvent extends NetSignal {
    Event: RemoteEvent
    constructor(middleware: Middleware, event: RemoteEvent){
        assert(event.IsA("RemoteEvent"), "Event must be a RemoteEvent")
        super(middleware)
        this.Event = event

        if (RunService.IsServer()){
            this.Event.OnServerEvent.Connect((player: Player, ...args: unknown[]) => {
                if (this.Middleware.RequestsPerMinute){
                    this.HandleUserRequestRate(player)
                }
                this.HandleInboundRequest(event, player, ...args)
            })
        }else{
            this.Event.OnClientEvent.Connect((...args: unknown[]) => {
                this.HandleInboundRequest(event, ...args)
            })
        }

    }    

    FireClient(Player: Player, ...args: unknown[]){
        assert(RunService.IsServer(), "FireClient can only be ran on the server.")
        this.HandleOutboundRequest(this.Event, Player, ...args)
        this.Event.FireClient(Player, ...args)
    }

    FireServer(...args: unknown[]){
        assert(RunService.IsClient(), "FireServer can only be ran on the client.")
        this.HandleOutboundRequest(this.Event, ...args)
        this.Event.FireServer(...args)
    }

    FireAllClients(...args: unknown[]){
        assert(RunService.IsServer(), "FireAllClients can only be ran on the server.")
        this.HandleOutboundRequest(this.Event, Players.GetPlayers(), ...args)
        this.Event.FireAllClients(...args)
    }

    FireToGroup(group: Player[], ...args: []){
        assert(RunService.IsServer(), "FireToGroup can only be ran on the server.")
        this.HandleOutboundRequest(this.Event, group, ...args)
        for (const [_, player] of pairs(group)){
            this.Event.FireClient(player, ...args)
        }
    }
}


export class NetSignalFunction extends NetSignal {
    Event: RemoteFunction
    constructor(middleware: Middleware, event: RemoteFunction){
        assert(event.IsA("RemoteFunction"), "Event must be a RemoteFunction")
        super(middleware)
        this.Event = event

        if (RunService.IsServer()){
            const runner = this
            this.Event.OnServerInvoke = function(player, ...args: unknown[]){
                runner.HandleUserRequestRate(player)
                return runner.HandleInboundRequest(runner.Event, player, ...args)
            }
        }else{
            const runner = this
            this.Event.OnClientInvoke = function(...args: unknown[]){
                return runner.HandleInboundRequest(runner.Event, ...args)
            }
        }
    }

    InvokeServer(...args: unknown[]){
        assert(RunService.IsClient(), "InvokeServer can only be ran on the client.")
        this.HandleOutboundRequest(this.Event, ...args)
        return this.Event.InvokeServer(...args)
    }

    InvokeClient(Player: Player, ...args: unknown[]){
        assert(RunService.IsServer(), "InvokeClient can only be ran on the server.")
        this.HandleOutboundRequest(this.Event, ...args)
        return this.Event.InvokeClient(Player, ...args)
    }
}
