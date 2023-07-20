import { Separator, select, confirm, input } from "@inquirer/prompts";
import { doLogin, doLogout } from "./login.js";
import { Store } from '../store.js';
import { createAssistant, deleteAssistant, deleteTelegramChannel, getAssistants, getTelegramChannels, registerTelegramChannel, setAssistantPrompt } from "../api.js";
import chalk from 'chalk';
import { assistantPicker } from "./assistant.js";



export async function promptChannelsMain(token: string, assistant?: any) {
    const answer = await select({
        message: 'What do you want to do with channels?',
        choices: [
          {
            name: 'List',
            value: 'list',            
            description: 'List all assistants',
          },
          {
            name: 'Register New',
            value: 'new',
            description: 'Create a new assistant',
          },
        ],
      });    
    
      switch (answer) {
        case 'list':
            const channel = await promptListChannels(token);
            await promptChannelAdminMenu(token, channel);
            break;
        case 'new':
            const type = await promptChannelType();
            switch (type) {
                case 'telegram':
                    await promptNewTelegramChannel(token);
                    break;
                case 'whatsapp':
                    console.log(chalk.red(`Whatsapp channel not implemented yet.`));
                    break;
                default:
                    break;
            }
            break;
        default:
            break;
      }    
}

export async function promptNewTelegramChannel(token: string) {
    const botToken = await input({ message: 'Enter bot token:' });
    // pick assistant
    const assistants = await getAssistants(token);
    if (assistants && assistants.length > 0) {
        const assistant = await assistantPicker(assistants);
        await registerTelegramChannel(token, botToken, assistant.assistantId);
        console.log(chalk.green(`Telegram channel registered successfully!`));
    } else {
        console.log(chalk.red(`No assistants found.`));
        console.log(chalk.red(`Please create an assistant first.`));
    }
    
}

export async function promptChannelType() {
    // pick channel type: telegram, whatsapp, etc
    const answer = await select({
        message: 'Select a channel type:',
        choices: [
            {
                name: 'Telegram',
                value: 'telegram',
                description: 'Telegram channel',
            },
            {
                name: 'Whatsapp',
                value: 'whatsapp',
                description: 'Whatsapp channel',
            },
        ]
    });

    return answer;
}

export async function promptChannelAdminMenu(token: string, channel: any) {
    const answer = await select({
        message: 'What do you want to do with this channel?',
        choices: [
          {
            name: 'Info',
            value: 'info',            
            description: 'Show channel info',
          },
          {
            name: 'Delete',
            value: 'delete',
            description: 'Delete this channel',
          },
        ],
      });  

    switch (answer) {
        case 'info':
            console.log(chalk.green(`Channel info (${channel.source}) :`));
            console.log(chalk.gray(`--------------------------------------------------`));
            console.log(chalk.gray(`  - Bot name: ${channel.register.botName}`));
            console.log(chalk.gray(`  - Assistant ID: ${channel.assistant.assistantId}`));
            console.log(chalk.gray(`  - Assistant name: ${channel.assistant.name}`));
            console.log(chalk.gray(`  - Assistant promptId: ${channel.assistant.promptId}`));
            console.log(chalk.gray(`  - Bot token: ${channel.register.botToken}`));

            break;
        case 'delete':
            const confirmDelete = await confirm({ message: `Are you sure you want to delete this channel?` });
            if (confirmDelete) {
                await deleteTelegramChannel(token, channel.register.botName);
                console.log(chalk.green(`Channel deleted successfully!`));
            }
            break;
        default:
            break;
    }

}

export async function promptListChannels(token: string) {
    /// Load registered channels from API
    const channels = await getTelegramChannels(token);
    if (!channels || channels.length === 0) {
        console.log(chalk.red(`No channels found.`));
        await promptChannelsMain(token);
        return;
    }

    const answer = await select({
        message: 'Select a channel to manage:',
        choices: channels.map((c: any) => {
            return {
                name: `${c.source} - ${c.register.botName}`,
                value: c
            }
        })
    });
    
    return answer;    
}