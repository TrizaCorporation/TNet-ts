import { NetSignalEvent, NetSignalType } from "./Dependencies/NetSignal"
import { ServerMiddleware } from "./Dependencies/Types"

export default class TNetServer {
    RemoteHandlers: Array<NetSignalType>
    Middleware?: ServerMiddleware
    constructor(middleware?: ServerMiddleware){
        this.RemoteHandlers = []
        this.Middleware = middleware
    }

    HandleRemoteEvent(event: RemoteEvent){
        return new NetSignalEvent(this.Middleware? this.Middleware : {}, event)
    }
}