// task.service.ts
import { CloudTasksClient } from '@google-cloud/tasks'
import { protos } from '@google-cloud/tasks'

import dotenv from 'dotenv';
import path from "path";

//const tasksKey = JSON.parse(process.env.TASKS_CREDENTIALS)

//const client = new CloudTasksClient({ credentials: tasksKey })
//dotenv.config({ path: './vars/.env'});

const PROJECT = process.env.GCP_PROJECT_ID!
const QUEUE = process.env.GCP_QUEUE_NAME!         // e.g. "process-book-queue"
const LOCATION = process.env.GCP_LOCATION!        // e.g. "us-central1"
const TASK_URL = process.env.TASK_HANDLER_URL!    // e.g. https://your-domain.com/internal/process-job

export const enqueueTextProcessingTask = async (textId: number, delaySeconds = 0) => {
    console.log("PROJECT, QUEUE, LOCATION, TASK_URL", PROJECT, QUEUE, LOCATION, TASK_URL);
   // const parent = client.queuePath(PROJECT, LOCATION, QUEUE)

    const task = {
        httpRequest: {
            httpMethod: protos.google.cloud.tasks.v2.HttpMethod.POST,
            url: `${TASK_URL}/internal/process`,
            headers: {
                'Content-Type': 'application/json',
            },
            body: Buffer.from(JSON.stringify({ textId })).toString('base64'),
        },
        scheduleTime: {
            seconds: Math.floor(Date.now() / 1000) + delaySeconds,
        },
    }

    //const [response] = await client.createTask({ parent, task })
    //console.log(`🕒 Task scheduled to run in ${delaySeconds}s:`, response.name)
    //return response
}
