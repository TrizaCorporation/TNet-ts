import { RunService } from "@rbxts/services"

interface Middleware {
    RequestsPerMinute?: number,
    Inbound?: object,
    Outbound?: Record<number, Callback>
}

class NetSignal {
    Middleware: Middleware
    constructor(middleware: Middleware){
        this.Middleware = middleware? middleware : {}
    }

    HandleOutboundRequest(event: RemoteEvent | RemoteFunction, ...args: []){
        if(this.Middleware.Outbound){
            for (const [_, handler] of pairs(this.Middleware.Outbound)){
                task.spawn(handler, event, ...args)
            }
        }
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
}


export class NetSignalFunction extends NetSignal {

}
