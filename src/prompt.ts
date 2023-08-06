import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';
import { publishPrompt } from './api.js';
import { IPrompterArguments } from './model/arguments.js';
import { Store } from './store.js';


export async function processPrompt (args: IPrompterArguments) {
    if (!args.prompt) {
        console.error(chalk.red(`Missing prompt file.`));
        process.exit(1);
    }

    // load prompt from file
    let promptPath = join(process.cwd(), args.prompt);

    // check if prompt file exists in disk
    if (!existsSync(promptPath)) {
        console.error(chalk.red(`Prompt file ${promptPath} not found.`));
        process.exit(1);
    }

    // retrieve token
    const store = new Store();
    const token = await store.getToken();

    if (!token) {
        console.error(chalk.red(`No token found. Please authenticate first. Execute: prompter-cli auth`));
        process.exit(1);
    }        

    // State Load
    //-----------------------------------------------------------
    let state = {};
    // read prompt file
    const promptFileContent = readFileSync(promptPath, 'utf8');
    // check if there is a file named [prompt].state.json
    const promptNameWithoutExtension = args.prompt.split('.').slice(0, -1).join('.');
    const promptStatePath = join(process.cwd(), promptNameWithoutExtension + '.state.json');
    if (existsSync(promptStatePath)) {
        console.log(chalk.gray(`Loading prompt state from ${promptStatePath}`));
        // load prompt state
        state = JSON.parse(readFileSync(promptStatePath, 'utf8'));
        console.log(chalk.gray(`Prompt state: ${JSON.stringify(state)}`));
    } else {
        console.log(chalk.gray(`No prompt state found at ${promptStatePath}`));
    }

    // show in console
    if (args.publish) {
        // publish prompt
        try {
            await publishPrompt(token, args.id || args.prompt, args.prompt, promptFileContent, state, args.desc);
            console.log(chalk.green(`Prompt ${args.id || args.prompt} published successfully.`));
            process.exit(0);
        } catch (error) {
            console.error(chalk.red(error));
            process.exit(1);
        }
    }    
}