#!/usr/bin/env node
import { Separator, input, select } from '@inquirer/prompts';
import figlet from 'figlet';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';
import { publishPrompt, uploadEmbedFile } from './api.js';
import { processArgs } from './model/arguments.js';
import { Store } from './store.js';
import { processEmbed } from './embeddings.js';
import { Execute } from './execute.js';
import { PromptMenu } from './menu/prompt-menu.js';




// welcome message using figlet
console.log(figlet.textSync('Prompter', {
    font: 'Standard',
    horizontalLayout: 'default',
    verticalLayout: 'default',
    width: 80,
    whitespaceBreak: true
}));


// load envs
export const PROMPTER_SERVER_URL = process.env.PROMPTER_SERVER_URL || "http://127.0.0.1:4000";
console.log(chalk.gray(`Prompter server url: ${PROMPTER_SERVER_URL}`));

// Parse arguments
const args = processArgs();

// Execute based on arguments
Execute(args).then(() => {
    // console.log(chalk.green(`Done.`))
}).catch((err) => {
    console.error(chalk.red(`Error: ${err}`));
    process.exit(1);
});


PromptMenu().then(() => {
    // console.log(chalk.green(`Done.`))
}
).catch((err: any) => {
    console.error(chalk.red(`Error: ${err}`));
    process.exit(1);
});






