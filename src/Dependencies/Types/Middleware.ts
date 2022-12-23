export interface ClientMiddleware {
    Inbound?: Array<Callback>,
    Outbound?: Array<Callback>
}

export interface ServerMiddleware {
    RequestsPerMinute?: number,
    Inbound?: Array<Callback>,
    Outbound?: Array<Callback>
}