const { Queue } = require("bullmq");
const { Worker } = require("bullmq");

const IORedis = require("ioredis");


const connection = new IORedis({ maxRetriesPerRequest: null });


const queue_blockchain = new Queue("queue_blockchain", {
    defaultJobOptions: { attempts: 3 },
});

queue_blockchain.setGlobalConcurrency(1);

new Worker(
    "queue_blockchain",
    async (job) => {
        if (job.name === "blockchainJob") {
            const { recordIdHash, recordMetaHash } = job.data;

            const crime = await addCrimeOnBC({
                recordIdHash,
                recordMetaHash,
            });

            if (!crime?.hash) {
                console.error("[ERROR][QUEUE_JOB][createCrimeJob]", crime);

                throw new Error("Crime not registered on blockchain", crime);
            }

            return crime;
        }
    },
    {
        connection,
        concurrency: 1,
        limiter: {
            max: 1,
            duration: 10000
        },


    },
);

exports.queue_blockchain = queue_blockchain;
