
import { input, confirm } from '@inquirer/prompts';
import { login } from '../api.js';
import chalk from 'chalk';
import { Store } from '../store.js';
import { doLogin } from './login.js';
import { readdirSync, promises, createReadStream, createWriteStream } from 'fs';
import axios from 'axios';
import path from 'path';
import * as unzipper from 'unzipper';


export async function doInit() {
    
    console.log(chalk.green(`Welcome to the Prompter CLI! Starter Kit`));


    // const sure = await confirm({ message: 'Are you sure you want to initialize this directory? (Y/n)?', default: true });
    
    try {
        // download starter kit from github
        await downloadGithubRepo('https://github.com/alejamp/lola-starter-assistant');

        // is logged in?
        const store = new Store();
        let token : string | undefined = await store.getToken();

        if (!token) {
            token = await doLogin();
        }
        
        console.log(`Token: ${token}`);

        // ask for assistant name
        const assistantName = await input({ message: 'Enter your assistant name:', default: 'My Assistant' });
        const setupTelegramChannel = await confirm({ message: 'Do you want to setup a Telegram channel? (Y/n)', default: true });
        const telegramToken = setupTelegramChannel ? await input({ message: 'Enter your Telegram bot token:' }) : undefined;



    }
    catch (err: any) {
        console.error(chalk.red(`Error: ${err?.message ?? 'Unknown error'}`));
        process.exit(1);
    }
}



async function downloadGithubRepo(url: string): Promise<void> {
    const repoUrl = new URL(url);
    const [owner, repo] = repoUrl.pathname.split('/').slice(1, 3);
    const zipUrl = `https://github.com/${owner}/${repo}/archive/refs/heads/main.zip`;

    const zipFile = path.join(process.cwd(), `${repo}.zip`);
    const extractDir = path.join(process.cwd(), repo);

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
    promises.cp(repoFolder, extractDir, { recursive: true });
    
    // delete repo repoFolder
    await promises.rm(repoFolder, { recursive: true, force: true });

    console.log(`Downloaded ${repo} successfully.`);
}
