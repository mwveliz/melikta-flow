import Melikta from 0xf8d6e0586b0a20c7

transaction(dispatchId: String, service: String, latencyMs: UInt64) {
    prepare(signer: &Account) {
        // Signer authorization validation hook
    }

    execute {
        Melikta.recordDispatch(
            dispatchId: dispatchId, 
            service: service, 
            latencyMs: latencyMs
        )
    }
}