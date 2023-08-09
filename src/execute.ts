import { Separator, input, select } from '@inquirer/prompts';
import figlet from 'figlet';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';
import { publishPrompt, uploadEmbedFile } from './api.js';
import { IPrompterArguments, processArgs } from './model/arguments.js';
import { Store } from './store.js';
import { processEmbed } from './embeddings.js';
import { processPrompt } from './prompt.js';
import { doInit } from './menu/init.js';


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
        // TODO: 
        await processPrompt(args);
    }    


    /// Init Starter kit
    // ------------------------------------------------------------------------------
    if (args.init) {
        console.log(chalk.gray(`Initializing starter kit...`));
        await doInit();
    }
}