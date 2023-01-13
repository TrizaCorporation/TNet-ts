import { NetSignalEvent, NetSignalFunction } from "./Dependencies/NetSignal"
import { Middleware } from "./Dependencies/Types"

interface RemoteHandlers {
    Functions: Array<NetSignalFunction>,
    Events: Array<NetSignalEvent>
}

export default class TNetClient {
    RemoteHandlers: RemoteHandlers
    Middleware?: Middleware
    constructor(middleware?: Middleware){
        this.RemoteHandlers = {Functions: [], Events: []}
        this.Middleware = middleware
    }

    HandleRemoteEvent(event: RemoteEvent){
        const createdEvent = new NetSignalEvent(this.Middleware? this.Middleware : {}, event)
        this.RemoteHandlers.Events.push(createdEvent)
        return createdEvent
    }

    HandleRemoteFunction(event: RemoteFunction){
        const createdEvent = new NetSignalFunction(this.Middleware? this.Middleware : {}, event)
        this.RemoteHandlers.Functions.push(createdEvent)
        return createdEvent
    }


    UpdateMiddleware(middleware: Middleware){
        this.Middleware = middleware
        for (const functionHandler of this.RemoteHandlers.Functions){
            functionHandler.Middleware = middleware
        }
        for (const eventHandler of this.RemoteHandlers.Events){
            eventHandler.Middleware = middleware
        }
    }
}