export default class QueueProcessor {
    private queue: Blob[];
    private processor: (item: Blob) => Promise<boolean>;
    private isProcessing: boolean;

    constructor(
        queue: Blob[],
        processor: (item: Blob) => Promise<boolean>
    ) {
        this.queue = queue;
        this.processor = processor;
        this.isProcessing = false;
    }

    async processQueue(): Promise<void> {
        if (this.isProcessing) return;

        this.isProcessing = true;

        while (this.queue.length > 0) {
            const itemToProcess = this.queue.at(0);
            if (itemToProcess === undefined) {
                throw new Error("No item to process");
            }
            
            const didProcess = await this.processor(itemToProcess);
            if (didProcess) {
                this.queue.shift();
            } else {
                throw new Error(`Failed to process item: ${itemToProcess}`);
            }
        }

        this.isProcessing = false;
    }

    addToQueue(item: Blob): void {
        this.queue.push(item);
        this.processQueue();
    }
}