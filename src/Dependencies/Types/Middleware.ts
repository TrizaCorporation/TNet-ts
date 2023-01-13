export interface Middleware {
    RequestsPerMinute?: number,
    Inbound?: Array<Callback>,
    Outbound?: Array<Callback>
}