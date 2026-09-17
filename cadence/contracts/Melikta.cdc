access(all) contract Melikta {

    access(all) event DispatchLogged(
        dispatchId: String, 
        service: String, 
        latencyMs: UInt64, 
        timestamp: UFix64
    )

    access(all) struct DispatchRecord {
        access(all) let service: String
        access(all) let latencyMs: UInt64
        access(all) let processedAt: UFix64

        init(service: String, latencyMs: UInt64, timestamp: UFix64) {
            self.service = service
            self.latencyMs = latencyMs
            self.processedAt = timestamp
        }
    }

    access(all) var history: {String: DispatchRecord}

    init() {
        self.history = {}
    }

    access(all) fun recordDispatch(dispatchId: String, service: String, latencyMs: UInt64) {
        let blockTime = getCurrentBlock().timestamp
        let record = DispatchRecord(service: service, latencyMs: latencyMs, timestamp: blockTime)
        
        self.history[dispatchId] = record

        emit DispatchLogged(
            dispatchId: dispatchId, 
            service: service, 
            latencyMs: latencyMs, 
            timestamp: blockTime
        )
    }

    access(all) view fun getAllDispatches(): {String: DispatchRecord} {
        return self.history
    }
}