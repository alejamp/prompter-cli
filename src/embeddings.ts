import chalk from 'chalk';
import { IPrompterArguments } from "./model/arguments.js";
import { join } from 'path';
import { existsSync, readFileSync } from 'fs';
import { Store } from './store.js';
import { uploadEmbedFile } from './api.js';
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
    let collection = args.collection ?? embedNameWithoutExtension;

    console.log(chalk.gray(`DocumentId: ${args.embed}`));
    console.log(chalk.gray(`Collection: ${collection}`));
    console.log(chalk.gray(`Chunk size: ${args.chunkSize ?? 1000}`));

    const spinner = new Spinner("Processing... %s");
    spinner.setSpinnerString("|/-\\\\");
    spinner.start();
    

    // read file
    const fileContent = readFileSync(filePath, 'utf-8');

    // retrieve token
    const store = new Store();
    const token = await store.getToken();

    if (!token) {
        console.error(chalk.red(`No token found. Please authenticate first. Execute: prompter-cli auth`));
        process.exit(1);
    }
    
    // upload content
    const res = await uploadEmbedFile(args.embed, collection, fileContent, token, args.chunkSize);    
    //  print all response properties
    // console.log(chalk.gray(`Response: ${JSON.stringify(res.data)}`));
    spinner.stop(true);
    const chunks = res?.data?.ids ?? 0;
    console.log(chalk.green(`File ${args.embed} uploaded in ${chunks.length} chunks.`));
}