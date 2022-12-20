import { RunService } from "@rbxts/services"
import NetSignalConnection, { NetSignalConnectionType } from "./NetSignalConnection"

interface Middleware {
    RequestsPerMinute?: number,
    Inbound?: object,
    Outbound?: Record<number, Callback>
}

class NetSignal {
    Middleware: Middleware
    Connections: Array<NetSignalConnectionType>
    constructor(middleware: Middleware){
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
    constructor(middleware: Middleware, event: RemoteEvent){
        assert(event.IsA("RemoteEvent"), "Event must be a RemoteEvent")
        super(middleware)
        this.Event = event
    }    

    Fire(...args: Player[]){
        if(RunService.IsServer()){
            const player = args[0]
            this.Event.FireClient(player, ...args)
        }else{
            this.Event.FireServer(...args)
        }
    }

    FireAllClients(...args: []){
        assert(RunService.IsServer(), "FireAllClients can only be ran on the server.")
        this.Event.FireAllClients(...args)
    }

    FireToGroup(group: [Player], ...args: []){
        assert(RunService.IsServer(), "FireAllClients can only be ran on the server.")
        for (let [_, player] of pairs(group)){
            this.Event.FireClient(player, ...args)
        }
    }
}


export class NetSignalFunction extends NetSignal {
    Event: RemoteFunction
    constructor(middleware: Middleware, event: RemoteFunction){
        assert(event.IsA("RemoteFunction"), "Event must be a RemoteEvent")
        super(middleware)
        this.Event = event
    }

    Fire(...args: Player[]){
        
    }
}
