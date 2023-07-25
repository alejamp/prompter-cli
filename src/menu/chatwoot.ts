import { input, select, confirm } from '@inquirer/prompts';
import chalk from 'chalk';
import { getChatwootAccounts, registerChatwootAccount, unregisterChatwootAccount } from '../api.js';




export async function promptChatwootAccountMenu(token: string) {
    const acc: any = await promptChatwootAccountsPicker(token);

    if (!acc) {
        return;
    }

    // acc structure:
    // id!: string;
    // // A tenantId can have only one chatwoot account
    // tenantId: string;
    // // This is needed to register a chatwoot acocunt
    // chatwootUrl: string;
    // userApiKey: string;
    // accountId: number;
    // accountName: string;
    // // // Each tenantId/chatwoot account can have multiple bots
    // // bots?: ChatwootBot[];
    // createdAt: Date;

    const answer = await select({
        message: 'What do you want to do?',
        choices: [
            {
                name: 'View Details',
                value: 'view',
                description: 'View account details',
            },
            {
                name: 'Unregister',
                value: 'unregister',
                description: 'Unregister account',
            },
        ],
    });

    switch (answer) {
        case 'view':
            console.log(chalk.gray(`--------------------------------------------------`));
            console.log(chalk.green(`Account details:`));
            console.log(chalk.gray(`--------------------------------------------------`));
            console.log(chalk.gray(`  - Account name: ${acc.accountName}`));
            console.log(chalk.gray(`  - Account ID: ${acc.accountId}`));
            console.log(chalk.gray(`  - Chatwoot URL: ${acc.chatwootUrl}`));
            console.log(chalk.gray(`  - User API Key: ${acc.userApiKey}`));
            console.log(chalk.gray(`  - Created at: ${acc.createdAt}`));
            console.log(chalk.gray(`--------------------------------------------------`));
            break;
        case 'unregister':
            const confirmAnswer = await confirm({
                message: `Are you sure you want to unregister account ${acc.accountName}?`,
                default: false
            });
            if (confirmAnswer) {
                await unregisterChatwootAccount(token, acc.id);
                console.log(chalk.green(`Account unregistered successfully!`));
            }
            break;
        }
}


export async function promptChatwootAccountsPicker(token: string) {

    const accounts = await getChatwootAccounts(token) ?? [];

    // if (!accounts || accounts.length === 0) {
    //     console.log(chalk.red(`No Chatwoot accounts registered yet.`));
    //     // return;
    // }

    const items = accounts.map((acc: any) => {
        return {
            name: `${acc.accountName} (${acc.accountId}) at ${acc.chatwootUrl}`,
            value: acc
        }
    });

    items.push({
        name: 'Register New Account...',
        value: 'new'
    });

    const answer = await select({
        message: 'Select a Cahtwoot Account:',
        choices: items
    });

    if (answer === 'new') {
        await promptNewChatwootAccount(token);
        return;
    }
    
    return answer;    
}


export async function promptNewChatwootAccount(token: string) {
    // ask for chatwoot url
    const chatwootUrl = await input({ message: 'Enter Chatwoot URL:', default: 'https://chatwoot.leapfinancial.com' });
    // ask for api key
    const apiKey = await input({ message: 'Enter Chatwoot API Key:' });
    // ask for account name
    const accountId = await input({ message: 'Enter Chatwoot Account Id:' });

    // register account
    const res = registerChatwootAccount(token, accountId, chatwootUrl, apiKey);

    console.log(chalk.green(`Chatwoot account registered successfully!`));

    return res;
}

