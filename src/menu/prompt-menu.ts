import { Separator, select } from "@inquirer/prompts";
import { doLogin, doLogout } from "./login.js";
import { Store } from '../store.js';
import { promptAssistantMenu } from "./assistant.js";
import { promptChannelsMain } from "./channels.js";
import { promptEmbeddingsMain } from "./embeddings.js";
import { promptChatwootAccountMenu } from "./chatwoot.js";

export async function PromptMenu() {

    let isLogged = false;
    const store = new Store();
    const token = await store.getToken();
    if (token) {
        isLogged = true;
    }

    if (!isLogged) {
        await promptLoginMenu();
    } else {
        await promptMainMenu(token);
    }

}


export async function promptMainMenu(token: string) {
    const answer = await select({
        message: 'What do you want to do?',
        choices: [
          {
            name: 'Login',
            value: 'login',            
            description: 'Login to prompter using your username and password',
          },          
          {
            name: 'Channels',
            value: 'channels',            
            description: 'Manage channels: Telegram, Whatsapp, Chatwoot, etc.',
          },
          {
            name: 'Chatwoot Accounts',
            value: 'chatwoot',
            description: 'Manage Chatwoot Accounts',
          },
          {
            name: 'Assistants',
            value: 'assistants',            
            description: 'Manage assistants',
          },
          {
            name: 'Prompts',
            value: 'prompts',
            description: 'Manage prompts',
          },
          {
            name: 'Embeddings',
            value: 'embeddings',
            description: 'Manage embeddings',
          },
        new Separator(), 
          {
            name: 'Logout',
            value: 'logout',
            description: 'Logout from prompter',
          },         
        ],
      }); 
      
    switch (answer) {
        case 'login':
            doLogin();
            break;
        case 'channels':
            promptChannelsMain(token);
            break;
        case 'assistants':
            promptAssistantMenu(token);
            break;
        case 'prompts':
            console.log('prompts');
            break;
        case 'chatwoot':
            promptChatwootAccountMenu(token);
            break;
        case 'embeddings':
          await promptEmbeddingsMain(token);
            break;
        case 'logout':
            doLogout();
            break;
        default:
            break;
    }
}

export async function promptLoginMenu() {
    const answer = await select({
        message: 'Select a package manager',
        choices: [
          {
            name: 'Login',
            value: 'login',            
            description: 'Login to prompter using your username and password',
          },
          {
            name: 'Logout',
            value: 'logout',
            description: 'Logout from prompter',
          },
        ],
      });    
    
      switch (answer) {
        case 'login':
            doLogin();
            break;
        case 'logout':
            console.log('logout');
            break;
        default:
            break;
      }    

}