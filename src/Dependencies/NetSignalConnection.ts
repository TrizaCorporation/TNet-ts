export interface NetSignalConnectionType {
    Callback?: Callback,
    Disconnect?: Callback
  }
  
export default class NetSignalConnection {
    Callback?: Callback
    constructor(Callback: Callback){
      this.Callback = Callback
    }
  
    Disconnect(){
      this.Callback = undefined
      setmetatable(this, {})
    }
  }