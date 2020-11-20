import UIKit
import R5Streaming

@objc(R5StreamConference)
class R5StreamConference: {

    var timer : Timer? = nil
    var failCount: Int = 0;
    
    @objc func subscribeBegin()
    {
       performSelector(onMainThread: #selector(subscribeTrigger), with: nil, waitUntilDone: false)
    }

    @objc func subscribeTrigger()
    {
        if( subscribeStream == nil )
        {
            let config = getConfig()
            // Set up the connection and stream
            let connection = R5Connection(config: config)
            self.subscribeStream = R5Stream(connection: connection)
            self.subscribeStream!.delegate = self
            self.subscribeStream?.client = self
            
            currentView?.attach(subscribeStream)
            
            self.subscribeStream!.play(appconfig.getParameter(param: "stream2") as! String, withHardwareAcceleration:appconfig.getParameter(param: "hwaccel_on") as! Bool)
        }
    }

    override func onR5StreamStatus(_ stream: R5Stream!, withStatus statusCode: Int32, withMessage msg: String!) {
        
        if(stream == self.publishStream){
            
            if(Int(statusCode) == Int(r5_status_start_streaming.rawValue)){
                
                self.timer = Timer.scheduledTimer(timeInterval: 2.5, target: self, selector: #selector(getStreams), userInfo: nil, repeats: false)
            }
        }
        
        if(stream == self.subscribeStream){
            if(Int(statusCode) == Int(r5_status_connection_error.rawValue)){
                failCount += 1
                if(failCount < 4){
                    self.timer = Timer.scheduledTimer(timeInterval: 2.5, target: self, selector: #selector(subscribeBegin), userInfo: nil, repeats: false)
                    self.subscribeStream = nil
                }
                else{
                    print("The other stream appears to be invalid")
                }
            }
        }
    }
    

    @objc func getStreams (){
        publishStream?.connection.call("streams.getLiveStreams", withReturn: "onGetLiveStreams", withParam: nil)
    }
    
    @objc func onGetLiveStreams (streams : String){
        
        NSLog("Got streams: " + streams)
        
        var names : NSArray
        
        do{
            names = try JSONSerialization.jsonObject(with: streams.data(using: String.Encoding.utf8)!, options: JSONSerialization.ReadingOptions.mutableContainers) as! NSArray
        } catch _ {
            self.timer = Timer.scheduledTimer(timeInterval: 1, target: self, selector: #selector(getStreams), userInfo: nil, repeats: false)
            return
        }
        
        for i in 0..<names.count {
            
            if( appconfig.getParameter(param: "stream2") as! String == names[i] as! String )
            {
                subscribeBegin()
                return
            }
        }
        
        self.timer = Timer.scheduledTimer(timeInterval: 1, target: self, selector: #selector(getStreams), userInfo: nil, repeats: false)
    }
    
    override func closeTest() {
        
        if(self.timer != nil){
            self.timer?.invalidate()
        }
        
        super.closeTest()
    }
    
    @objc func onMetaData(data : String){
        
    }
}
