import { Separator, input, select } from '@inquirer/prompts';
import figlet from 'figlet';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';
import { publishPrompt, uploadEmbedFile } from './api.js';
import { IPrompterArguments, processArgs } from './model/arguments.js';
import { Store } from './store.js';
import { processEmbed } from './embeddings.js';


export async function Execute(args: IPrompterArguments) : Promise<void> {
    /// EMBED   
    // ------------------------------------------------------------------------------
    if (args.embed) {
        await processEmbed(args);
    }

    /// AUTH
    // ------------------------------------------------------------------------------
    if (args.auth) {
        console.log(chalk.gray(`Authenticating...`));
        //inquire for token
        await input({
            message: 'Enter your token:',
            validate: (value) => {
                // console.log(chalk.red(value));
                if (value.length) {
                    const store = new Store();
                    store.setToken(value).then(() => {
                        console.log(chalk.green(`Token saved.`));
                    }).catch((err) => {
                        console.error(chalk.red(`Error saving token: ${err}`));
                    }); 
                    return true;
                } else {
                    return 'Please enter your token.';
                }
            }
        });
        process.exit(0);

        // save token
    }


    /// VERSION
    // ------------------------------------------------------------------------------
    if (args.version) {
        // get package version
        // const packageJson = JSON.parse(readFileSync('../package.json', 'utf8'));
        // console.log(`Version: ${packageJson.version}`);
        console.log(`Version: ${process.env.npm_package_version}`);
        process.exit(0);
    }

    /// PUBLISH PROMPT
    // ------------------------------------------------------------------------------
    if (args.prompt || args.publish) {
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
            publishPrompt(args.id || args.prompt, args.prompt, promptFileContent, state, args.desc).then(() => {
                console.log(chalk.green(`Prompt ${args.id || args.prompt} published successfully.`));
                process.exit(0);
            }).catch((error) => {
                console.error(chalk.red(error));
                process.exit(1);
            });
        }
    }    
}