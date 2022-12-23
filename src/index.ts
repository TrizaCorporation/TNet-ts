/*

  _______   __     __ 
 /_  __/ | / /__  / /_
  / / /  |/ / _ \/ __/
 / / / /|  /  __/ /_  
/_/ /_/ |_/\___/\__/  
                      
TNet(ts)

Programmer(s): CodedJimmy

*/

import { RunService } from "@rbxts/services";
import TNetServer from "./Server"
import TNetClient from "./Client";

export default function(){
	if (RunService.IsServer()){
		return TNetServer
	}else{
		return TNetClient
	}
}