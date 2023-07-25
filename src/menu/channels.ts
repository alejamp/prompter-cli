import { select, confirm, input } from "@inquirer/prompts";
import { deleteTelegramChannel, getAllChatwootBotsFromTenant, getAssistants, getChatwootAccounts, getTelegramChannels, registerChatwootBot, registerTelegramChannel, setAssistantPrompt, unregisterChatwootBot } from "../api.js";
import chalk from 'chalk';
import { assistantPicker, promptAssistantPicker } from "./assistant.js";
import { promptChatwootAccountsPicker } from "./chatwoot.js";



export async function promptChannelsMain(token: string, assistant?: any) {

    const telegramChannels = await getTelegramChannels(token) ?? [];
    const chatwootBots = await getAllChatwootBotsFromTenant(token) ?? [];

    // chatwoot bots
    // {
    //     "id": 3,
    //     "name": "TestBot1",
    //     "description": "Test1",
    //     "outgoing_url": "https://6c0b-181-168-225-209.ngrok-free.app/api/chatwoot/messages/yUPGw1E97ASZZIt7idUnQw%3D%3D-cYzX27HVCfxuqEMSjkLF66Av140WemMB2otVnc7okle%2FCWjD7FoFLwVv4NrHcdGA",
    //     "bot_type": "webhook",
    //     "bot_config": {},
    //     "account_id": 4,
    //     "access_token": "Pxi3GYQTkAvPeBbB4RMkL84F"
    //   },    

    const choices = [
        ... telegramChannels.map((c: any) => {
            return {
                name: `Telegram: ${c.register.botName} for assistant: ${c.assistant.name}`,
                value: c,
                description: `Select ${c.register.botName}`,
            }
        }),
        ... chatwootBots.map((c: any) => {
            return {
                name: `Chatwoot AgentBot: ${c.name} at account: ${c.account_id}`,
                value: c,
                description: `Select ${c.name}`,
            }
        }),
        ... [
            {
                name: 'Register New',
                value: 'new',
                description: 'Create a new assistant',
            }
        ]
    ];


    const answer = await select({
        message: 'What do you want to do with channels?',
        choices: choices
      });    
    
      switch (answer) {
        case 'new':
            const type = await promptChannelType();
            switch (type) {
                case 'telegram':
                    await promptNewTelegramChannel(token);
                    break;
                case 'chatwoot':
                    await promptNewChatwootBot(token);
                    break;                    
                case 'whatsapp':
                    console.log(chalk.red(`Whatsapp channel not implemented yet.`));
                    break;
                default:
                    break;
            }
            break;
        default:
            await promptChannelAdminMenu(token, answer);
            break;
      }    
}


export async function promptNewChatwootBot(token: string) {

    // New bot data:
    // {
    //     "accountRegId": "{{accountRegId}}",
    //     "botName": "TestBotDemo",
    //     "botDesc": "Test Demo Assistant",
    //     "assistantId": "{{assitantId}}"
    // }

    const botName = await input({ message: 'Enter bot name:' });
    const botDesc = await input({ message: 'Enter bot description:' });
    const chatwootAccount: any = await promptChatwootAccountsPicker(token);
    const accountRegId = chatwootAccount.id;
    const assistant = await promptAssistantPicker(token);

    if (!assistant) {
        console.log(chalk.red(`No assistant selected.`));
        console.log(chalk.red(`Please create an assistant first.`));
        return;
    }
    
    await registerChatwootBot(token, accountRegId, botName, botDesc, assistant.assistantId);
    console.log(chalk.green(`Chatwoot bot registered successfully!`));
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
                name: 'Chatwoot',
                value: 'chatwoot',
                description: 'Cahtwoot Account',
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
            console.log(chalk.gray(`--------------------------------------------------`));
            console.log(chalk.green(`Channel info:`));
            console.log(chalk.gray(`--------------------------------------------------`));
            console.log(chalk.gray(JSON.stringify(channel, null, 2)));
            console.log(chalk.gray(`--------------------------------------------------`));

            break;
        case 'delete':
            const confirmDelete = await confirm({ message: `Are you sure you want to delete this channel?` });
            if (confirmDelete) {
                if (channel.register) {
                    await deleteTelegramChannel(token, channel.register.botName);
                    console.log(chalk.green(`Telegram Channel deleted successfully!`));
                }
                if (channel.account_id) {
                    await unregisterChatwootBot(token, channel.account_id, channel.id);
                    console.log(chalk.green(`Chatwoot Bot deleted successfully!`));
                }
            }
            break;
        default:
            break;
    }

}