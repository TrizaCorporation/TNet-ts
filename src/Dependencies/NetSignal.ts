import { RunService } from "@rbxts/services"
import NetSignalConnection, { NetSignalConnectionType } from "./NetSignalConnection"
import { ServerMiddleware, ClientMiddleware } from "./Types"

export interface NetSignalType {
    Middleware?: ServerMiddleware | ClientMiddleware
    Connections: Array<NetSignalConnectionType>,
    HandleInboundRequest: Callback,
    Fire: Callback | void
}

class NetSignal {
    Middleware: ServerMiddleware | ClientMiddleware
    Connections: Array<NetSignalConnectionType>
    constructor(middleware: ServerMiddleware | ClientMiddleware){
        this.Middleware = middleware? middleware : {}
        this.Connections = []
    }

    HandleOutboundRequest(event: RemoteEvent | RemoteFunction, ...args: []){
        if(this.Middleware.Outbound){
            for (const [_, handler] of pairs(this.Middleware.Outbound)){
                task.spawn(handler, event, ...args)
            }
        }
    }

    Connect(callback: Callback){
        let connection = new NetSignalConnection(callback)
        this.Connections.push(connection)
    }
}


export class NetSignalEvent extends NetSignal {
    Event: RemoteEvent
    constructor(middleware: ServerMiddleware | ClientMiddleware, event: RemoteEvent){
        assert(event.IsA("RemoteEvent"), "Event must be a RemoteEvent")
        super(middleware)
        this.Event = event
    }    

    FireClient(Player: Player, ...args: unknown[]){
        assert(RunService.IsServer(), "FireClient can only be ran on the server.")
        this.Event.FireClient(Player, ...args)
    }

    FireServer(...args: unknown[]){
        assert(RunService.IsClient(), "FireServer can only be ran on the client.")
        this.Event.FireServer(...args)
    }

    FireAllClients(...args: unknown[]){
        assert(RunService.IsServer(), "FireAllClients can only be ran on the server.")
        this.Event.FireAllClients(...args)
    }

    FireToGroup(group: Player[], ...args: []){
        assert(RunService.IsServer(), "FireAllClients can only be ran on the server.")
        for (let [_, player] of pairs(group)){
            this.Event.FireClient(player, ...args)
        }
    }
}


export class NetSignalFunction extends NetSignal {
    Event: RemoteFunction
    constructor(middleware: ServerMiddleware | ClientMiddleware, event: RemoteFunction){
        assert(event.IsA("RemoteFunction"), "Event must be a RemoteFunction")
        super(middleware)
        this.Event = event
    }

    InvokeClient(Player: Player, ...args: unknown[]){
        assert(RunService.IsServer(), "FireClient can only be ran on the server.")
        return this.Event.InvokeClient(Player, ...args)
    }
}
