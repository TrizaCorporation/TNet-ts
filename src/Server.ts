interface Middleware {
    RequestsPerMinute?: number,
    Inbound?: object,
    Outbound?: object
}

export default class TNetServer {
    RemoteHandlers: Map<number, Callback>
    Middleware: Middleware
    constructor(middleware: Middleware){
        this.RemoteHandlers = new Map()
        this.Middleware = middleware? middleware : {}
    }

    HandleRemoteEvent(event: RemoteEvent){
        
    }
}