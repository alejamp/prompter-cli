import chalk from "chalk";
import axios from "axios";
import { PROMPTER_SERVER_URL } from "./index.js";


export async function semanticStoreQuery(token: string, collectionName: string, query: string, knn: number) {
    const url = PROMPTER_SERVER_URL + `/api/semantic-store/query`;

    const body = {
        collectionName: collectionName,
        text: query,
        k: knn
    };

    // perform a get to the prompter api using axios
    const response = await axios.post(url, body, {headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    return response.data;
}

export async function registerTelegramChannel (token: string, botToken: string, assistantId: string) {
    const url = PROMPTER_SERVER_URL + `/api/channel/telegram/register`;

    // console.log(chalk.gray(`POST ${url}`));

    const body = {
        token: botToken,
        assistantId: assistantId
    };

    // perform a get to the prompter api using axios
    const response = await axios.post(url, body, {headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    return response.data;
}


export async function deleteTelegramChannel (token: string, botName: string) {
    const url = PROMPTER_SERVER_URL + `/api/channel/telegram/unregister`;

    // console.log(chalk.gray(`POST ${url}`));

    const body = {
        botName: botName
    };

    // perform a get to the prompter api using axios
    const response = await axios.post(url, body, {headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    return response.data;
}


export async function getTelegramChannels (token: string) {
    const url = PROMPTER_SERVER_URL + `/api/channel/telegram`;

    // console.log(chalk.gray(`GET ${url}`));

    // perform a get to the prompter api using axios
    const response = await axios.get(url, {headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    return response.data;
}


export async function createAssistant(token: string, name: string, agent: string, promptId?: string) {
    console.log(chalk.green(`Creating assistant named: ${name}...`));
    const url = PROMPTER_SERVER_URL + `/api/tenant/assistant`;

    const body = {
        name: name,
        promptId: promptId,
        agent: agent
    };

    // console.log(chalk.gray(`POST ${url}`));

    // perform a get to the prompter api using axios
    const response = await axios.post(url, body, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    return response.data;
}


export async function setAssistantPrompt(token: string, assistant: any, promptId: any) {
    console.log(chalk.green(`Setting prompt ${promptId} to assistant ${assistant.name}...`));
    const url = PROMPTER_SERVER_URL + `/api/tenant/assistant/prompt`;

    const body = {
        assistantId: assistant.assistantId ?? assistant.id,
        promptId: promptId
    };

    // console.log(chalk.gray(`POST ${url}`));

    // perform a get to the prompter api using axios
    const response = await axios.post(url, body, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    return response.data;
}

export async function deleteAssistant(token: string, assistant: any) {
    const id = assistant.id ?? assistant.assistantId;
    console.log(chalk.green(`Deleting assistant ${assistant.name ?? id}...`));
    const url = PROMPTER_SERVER_URL + `/api/tenant/assistant/${id}`;

    // console.log(chalk.gray(`DELETE ${url}`));

    // perform a get to the prompter api using axios
    const response = await axios.delete(url, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    return response.data;
}

export async function getAssistants(token: string) {
    console.log(chalk.green(`Getting assistants...`));

    const url = PROMPTER_SERVER_URL + '/api/tenant/assistant';

    // console.log(chalk.gray(`GET ${url}`));

    // perform a get to the prompter api using axios
    const response = await axios.get(url, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    return response.data;
}


export async function login(username: string, password: string) : Promise<string> {
    console.log(chalk.green(`Logging in as ${username}...`));

    const url = PROMPTER_SERVER_URL + '/api/auth/login';

    // console.log(chalk.gray(`POST ${url}`));

    const body = {
        email: username,
        password: password
    };

    // perform a post to the prompter api using axios
    const response = await axios.post(url, body, {
        headers: {
            'Content-Type': 'application/json'
        }
    });

    return response.data.token;
}


export async function publishPrompt(promptId: string, promptName: string, promptFileContent: string, state?: any, desc?: string) : Promise<void> {
    console.log(chalk.green(`Publishing prompt ${promptId}...`));

    const url = PROMPTER_SERVER_URL + '/api/prompt';

    // console.log(chalk.gray(`POST ${url}`));

    const body = {
        id: promptId,
        name: promptName,
        description: desc,
        content: promptFileContent,
        owner: 'prompter-cli',
        enabled: true,
        state: state
    };

    // perform a post to the prompter api using axios
    const response = await axios.post(url, body, {
        headers: {
            'Content-Type': 'application/json'
        }
    });

    return;
}


export async function uploadEmbedFile(
    documentId: string, 
    collection: string, 
    fileContent: string, 
    token: string, 
    chunkSize?: number) : Promise<any> {
    

    const url = PROMPTER_SERVER_URL + '/api/semantic-store/save';

    // console.log(chalk.gray(`POST ${url}`));

    const body = {
        documentId: documentId,
        text: fileContent,
        collectionName: collection,
        options: {
            chunkSize: chunkSize,
            chunkOverlap: 0,
            cleanPreviousData: true,
            metadata: undefined
        }
    };

    // perform a post to the prompter api using axios
    const response = await axios.post(url, body, {
        headers: {
            'Content-Type': 'application/json',
            'x-lola-auth': token
        }
    });

    return response;
}