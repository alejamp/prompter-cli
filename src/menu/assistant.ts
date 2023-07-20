import { Separator, select, confirm, input } from "@inquirer/prompts";
import { doLogin, doLogout } from "./login.js";
import { Store } from '../store.js';
import { createAssistant, deleteAssistant, getAssistants, setAssistantPrompt } from "../api.js";
import chalk from 'chalk';



export async function promptAssistantMenu(token: string) {
    const answer = await select({
        message: 'What do you want to do with assistants?',
        choices: [
          {
            name: 'Select',
            value: 'select',            
            description: 'List all assistants',
          },
          {
            name: 'Create new',
            value: 'new',
            description: 'Create a new assistant',
          },
        ],
      });    
    
      switch (answer) {
        case 'select':
            console.log('select assistant');
            const l = await getAssistants(token);
            if (!l || l.length === 0) {
                console.log(chalk.red(`No assistants found.`));
                await promptAssistantMenu(token);
                break;
            }
            const assistant = await assistantPicker(l);
            await selectedAssistantMenu(token, assistant);
            break;
        case 'new':
            await promptNewAssistant(token);
            break;
        default:
            break;
      }    
}

export async function promptNewAssistant(token: string) {
    const name = await input({ message: 'Enter assistant name:' });
    const agent = await input({ message: 'Enter Agent (default: lola):', default: 'lola' });
    const promptId = await input({ message: 'Enter promptId (optional):' });

    const assistant = await createAssistant(token, name, agent, promptId);
    console.log(chalk.green(`Assistant "${assistant.name}" created successfully!`));
    await selectedAssistantMenu(token, assistant);
}


export async function selectedAssistantMenu(token: string, assistant: any) {
    const answer = await select({
        message: 'What do you want to do with this assistant?', 
        choices: [
            {
                name: 'View Details',
                value: 'view',            
                description: 'View assistant details',
            },            
            {
                name: 'Assign Prompt',
                value: 'set-prompt',            
                description: 'Assign a prompt to this assistant',
            },             
            {
                name: 'Channels',
                value: 'channels',            
                description: 'Manage channels: Telegram, Whatsapp, Chatwoot, etc.',
            },            
            {
                name: 'Delete',
                value: 'delete',            
                description: 'Delete assistant',
            },
        ],
      });    
    
    switch (answer) {
        case 'view':
            console.log(chalk.green(`\nAssistant "${assistant.name}" details:`));
            console.log(chalk.gray(`--------------------------------------------`));
            console.log(chalk.gray(`ID: ${assistant.assistantId}`));
            console.log(chalk.gray(`Agent: ${assistant.agent}`));
            console.log(chalk.gray(`Prompt ID: ${assistant.promptId}`));
            console.log(chalk.gray(`Created at: ${assistant.createdAt}`));
            console.log(chalk.gray(`\nASSISTANT KEY`));
            console.log(chalk.gray(`--------------------------------------------`));
            console.log(chalk.italic(`${assistant.key}`));
            console.log(chalk.gray(`--------------------------------------------`));
            break;

        case 'set-prompt':
            await promptAssistantPromptId(token, assistant);
            break;

        case 'channels':
            console.log('channels');
            break;

        case 'delete':
            await promptDeleteAssistant(token, assistant);
            break;

        default:
            break;
    }

}

export async function promptAssistantPromptId(token: string, assistant: any) {
    const promptId = await input({ message: 'Enter Prompt ID:' });

    try {
        await setAssistantPrompt(token, assistant, promptId);
        console.log(chalk.green(`Prompt ${promptId} assigned to assistant ${assistant.name}`));
    }
    catch (e: any) {
        console.error(e.message);
    }
}


export async function promptDeleteAssistant(token: string, assistant: any) {
    const answer = await confirm({ message: 'Are you sure you want to delete this assistant?' });
    if (answer) {
        try {
            await deleteAssistant(token, assistant);
            console.log(chalk.green(`Assistant ${assistant.name} deleted`));
        }
        catch (e: any) {
            console.error(e.message);
        }
        
    }
}



export async function assistantPicker(list: any[]) : Promise<any> {
    const orderedList = list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const answer = await select({
        message: 'Select an assistant',
        choices: orderedList.map((a) => {
            const idFirst4letters = a.id?.substring(0, 4) ?? '?????';
            return {
                name: a.name ?? `${idFirst4letters}...`,
                value: a
            }
        })
    });
    
    return answer;
}