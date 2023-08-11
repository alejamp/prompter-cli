
import { input, confirm } from '@inquirer/prompts';
import { createAssistant, login, publishPrompt, registerTelegramChannel } from '../api.js';
import chalk from 'chalk';
import { Store } from '../store.js';
import { doLogin } from './login.js';
import { readdirSync, promises, createReadStream, createWriteStream } from 'fs';
import axios from 'axios';
import path from 'path';
import * as unzipper from 'unzipper';
import { PROMPTER_SERVER_URL } from '../index.js';


export async function doInit() {
    
    console.log(chalk.green(`Welcome to the Prompter CLI! Starter Kit`));


    // const sure = await confirm({ message: 'Are you sure you want to initialize this directory? (Y/n)?', default: true });
    
    try {
        // download starter kit from github
        // await downloadGithubRepo('https://github.com/alejamp/lola-starter-assistant', process.cwd());

        // is logged in?
        const store = new Store();
        let token : string | undefined = await store.getToken();

        if (!token) {
            token = await doLogin();
        }
        
        console.log(`Token: ${token}`);

        // ask for assistant name
        const assistantName = await input({ message: 'Enter your assistant name:', default: 'my-assistant' });
        const setupTelegramChannel = await confirm({ message: 'Do you want to setup a Telegram channel? (Y/n)', default: true });
        const telegramToken = setupTelegramChannel ? await input({ message: 'Enter your Telegram bot token:' }) : undefined;

        console.log(chalk.green(`Initializing assistant ${assistantName}...`));
        console.log(chalk.gray(`Downloading starter kit...`));
        const workingDir = path.join(process.cwd(), assistantName);
        await downloadGithubRepo('https://github.com/alejamp/lola-starter-assistant', workingDir);

        // Create assistant
        console.log(chalk.gray(`Creating assistant...`));
        const promptId =  `${assistantName}-prompt.hbr`;
        console.log(`Assistant's Prompt Id: ${promptId}`);
        const assistant = await createAssistant(token!, assistantName, 'lola', promptId);
        console.log(chalk.green(`Assistant "${assistant.name}" created successfully!`));

        // upload prompt
        console.log(chalk.gray(`Uploading prompt...`));
        const promptPath = path.join(workingDir, 'prompt.hbr');
        const promptContent = await promises.readFile(promptPath, 'utf-8');
        const stateContent = await promises.readFile(path.join(workingDir, 'prompt.state.json'), 'utf-8');
        const state = JSON.parse(stateContent);

        await publishPrompt(token!, promptId, "prompt", promptContent, state, "Created from Start Kit")

        console.log(chalk.green(`Prompt uploaded successfully!`));

        // Create Telegram channel
        if (setupTelegramChannel) {
            console.log(chalk.gray(`Creating Telegram channel...`));
            const channel = await registerTelegramChannel(token!, telegramToken!, assistant.assistantId);
            console.log(chalk.green(`Telegram channel created successfully!`));
            console.log(chalk.green(`Telegram bot url: https://t.me/${channel.botName}`));
        }

        // Create .env file
        console.log(chalk.gray(`Creating .env file...`));
        await createEnvFile(workingDir, assistant.key);


        console.log(chalk.green(`Congratulations! your assistant is ready!\nLet's talk to it!`));
        process.exit(0);
    }
    catch (err: any) {
        console.error(chalk.red(`Error: ${err?.message ?? 'Unknown error'}`));
        process.exit(1);
    }
}



async function downloadGithubRepo(url: string, workingDir: string): Promise<void> {
    const repoUrl = new URL(url);
    const [owner, repo] = repoUrl.pathname.split('/').slice(1, 3);
    const zipUrl = `https://github.com/${owner}/${repo}/archive/refs/heads/main.zip`;

    const zipFile = path.join(process.cwd(), `${repo}.zip`);
    const extractDir = workingDir;//path.join(process.cwd(), repo);

    // extractDir exists? 
    if (readdirSync(process.cwd()).includes(repo)) {
        console.log(chalk.red(`WARNING -> ${extractDir} already exists.`));

        // check if current folder is empty
        const files = readdirSync(extractDir);
        if (files.length > 0) {
            console.log(chalk.red(`${extractDir} is not empty.`));
            console.log(chalk.red(`Please initialize an empty directory.`));
            console.log(chalk.red(`Aborted.`));
            process.exit(1);
        }        
    }



    console.log(`Downloading ${zipUrl}...`);
    const response = await axios({
    method: 'get',
    url: zipUrl,
    responseType: 'stream',
    });
    response.data.pipe(createWriteStream(zipFile));
    await new Promise<void>((resolve, reject) => {
    response.data.on('end', () => {
        resolve();
    });
    response.data.on('error', (err: any) => {
        reject(err);
    });
    });

    console.log(`Extracting ${zipFile} to ${extractDir}...`);
    await promises.mkdir(extractDir, { recursive: true });
    await createReadStream(zipFile).pipe(unzipper.Extract({ path: extractDir })).promise();

    console.log(`Cleaning up ${zipFile}...`);
    await promises.unlink(zipFile);

    // copy all files from repo folder to current folder
    const repoFolder = path.join(extractDir, `${repo}-main`);

    // promises.cp(repoFolder, process.cwd(), { recursive: true });
    await promises.cp(repoFolder, extractDir, { recursive: true });
    
    // delete repo repoFolder
    await promises.rm(repoFolder, { recursive: true, force: true });
    // await promises.rm(extractDir, { recursive: true, force: true });

    console.log(`Downloaded ${repo} successfully.`);
}


export async function createEnvFile(workingDir: string, token: string) {

    const vars = {
        ASSISTANT_TOKEN: token,
        PROMPTER_URL: PROMPTER_SERVER_URL,
        HOST: "localhost",
        PORT: 5000,
        WEBHOOK_URL: "http://127.0.0.1:5000",
    }

    const envPath = path.join(workingDir, '.env');
    const envContent = Object.entries(vars).map(([key, value]) => `${key}=${value}`).join('\n');
    await promises.writeFile(envPath, envContent);

}
