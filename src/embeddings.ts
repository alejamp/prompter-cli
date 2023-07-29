import chalk from 'chalk';
import { IPrompterArguments } from "./model/arguments.js";
import { join } from 'path';
import { existsSync, readFileSync } from 'fs';
import { Store } from './store.js';
import { uploadEmbedFile, uploadEmbedFileMarkdown } from './api.js';
import { Spinner } from 'cli-spinner';

export async function processEmbed(args: IPrompterArguments) {
    console.log(chalk.gray(`Embedding file ${args.embed}...`));

    if (!args.embed) {
        console.error(chalk.red(`No file specified.`));
        process.exit(1);
    }
    
    // check if file exists
    const filePath = join(process.cwd(), args.embed);
    if (!existsSync(filePath)) {
        console.error(chalk.red(`File ${filePath} not found.`));
        process.exit(1);
    }

    let embedNameWithoutExtension = args.embed.split('.').slice(0, -1).join('.');
    let extension = args.embed.split('.').pop();
    let collection = args.collection ?? embedNameWithoutExtension;
    let splitTables = args.splitTables ?? false;

    console.log(chalk.bold(`DocumentId: ${args.embed}`));
    console.log(chalk.bold(`Collection: ${collection}`));
    // console.log(chalk.gray(`Chunk size: ${args.chunkSize ?? 1000}`));


    // read file
    const fileContent = readFileSync(filePath, 'utf-8');

    // retrieve token
    const store = new Store();
    const token = await store.getToken();

    if (!token) {
        console.error(chalk.red(`No token found. Please authenticate first. Execute: prompter-cli auth`));
        process.exit(1);
    }


    const spinner = new Spinner("Processing... %s");
    spinner.setSpinnerString("|/-\\\\");
    spinner.start();
        
    
    // upload content
    if (extension?.toLowerCase() === 'txt') {
        // console.log(chalk.gray(`Uploading file ${args.embed} as plain text...`));
        const res = await uploadEmbedFile(args.embed, collection, fileContent, token, args.chunkSize);
        printEmbedReport(res);
        spinner.stop(true);
        console.log(chalk.green(`File uploaded as plain text.`));
        console.log(chalk.gray(`Chunk size: ${args.chunkSize ?? 1000}`));
        process.exit(0);
    } 

    if (extension?.toLowerCase() === 'md') {
        // console.log(chalk.gray(`Uploading file ${args.embed} as markdown...`));
        const res = await uploadEmbedFileMarkdown(args.embed, collection, fileContent, splitTables, token);
        printEmbedReport(res);
        spinner.stop(true);
        console.log(chalk.green(`File uploaded as markdown.`));
        process.exit(0);
    }

    console.log(chalk.red(`File extension not supported.`));
    // exit process
    process.exit(1);
}

export function printEmbedReport(res: any) {
    for (let i = 0; i < res.texts.length; i++) {
        const text = res.texts[i];
        const tokens = res.tokens[i];
        const id = res.ids[i];

        console.log(chalk.green(`------------------------------------------------------------------`));
        console.log(chalk.bold(`ID: ${id}`));
        console.log(chalk.gray(`Text: ${text}`));
        console.log(chalk.bold(`Tokens: ${tokens}`));
    }
    console.log(chalk.green(`------------------------------------------------------------------`));
    console.log(chalk.green(`File uploaded in ${res.ids.length} chunks.`));     
    console.log(chalk.bold(`Avg Tokens: ${res.avgTokens}`));
    console.log(chalk.bold(`Max. Tokens: ${res.maxTokens}`));
    console.log(chalk.bold(`Min. Tokens: ${res.minTokens}`)); 
    // total tokens:
    console.log(chalk.bold(`Total Tokens: ${res.tokens.reduce((a: number, b: number) => a + b, 0)}`));
    console.log(chalk.green(`------------------------------------------------------------------`));
}