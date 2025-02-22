export default class QueueProcessor {
    constructor(queue, processor) {
        this.queue = queue;
        this.processor = processor;
        this.isProcessing = false;
    }

    async processQueue() {
        if (this.isProcessing) return;

        this.isProcessing = true;

        while (this.queue.length > 0) {
            const itemToProcess = this.queue.at(0);
            const didProcess = await this.processor(itemToProcess);
            if (didProcess) {
                this.queue.shift();
            } else {
                console.error("Failed to process item:", itemToProcess);
                break;
            }
        }

        this.isProcessing = false;
    }

    addToQueue(item) {
        this.queue.push(item);
        this.processQueue();
    }
}