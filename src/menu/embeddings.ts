

import { Separator, select, confirm, input } from "@inquirer/prompts";
import { doLogin, doLogout } from "./login.js";
import { Store } from '../store.js';
import { createAssistant, deleteAssistant, getAssistants, semanticStoreQuery, setAssistantPrompt } from "../api.js";
import chalk from 'chalk';



export async function promptEmbeddingsMain(token: string) {
    const answer = await select({
        message: 'What do you want to do with embeddings?',
        choices: [
          {
            name: 'Query',
            value: 'query',
            description: 'Query embeddings',
          },
          {
            name: 'Upload Text File',
            value: 'upload',
            description: 'Upload a text file',
          },
        ],
      });    
    
      switch (answer) {
        case 'query':
            await promptEmbeddingsQuery(token);
            break;
        case 'upload':
            console.log('upload text file');
            break;
        default:
            break;
      }    
}

export async function promptEmbeddingsQuery(token: string) {
    const collectionName = await input({ message: 'Enter collection name:' });
    const knn = await input({ message: 'Enter knn (default: 3):', default: '3' });
    let continueQuery = true;
    while (continueQuery) {
      const query = await input({ message: 'Enter query:' });
      await queryEmbeddings(token, collectionName, query, parseInt(knn));
      continueQuery = await confirm({ message: 'Do you want to continue querying?', default: true });
    }
}

export async function queryEmbeddings(token: string, collectionName: string, query: string, knn: number) {
  console.log(chalk.green(`Query "${query}" on collection "${collectionName}" with knn ${knn}...`));
  const res = await semanticStoreQuery(token, collectionName, query, knn);
  
  if (!res || res.length === 0) {
      console.log(chalk.red(`No results found.`));
      await promptEmbeddingsQuery(token);
      return;
  }
  
  for (const r of res) {
      console.log(chalk.green(`------------------------------------------------------------------`));
      console.log(chalk.bold(`Score: ${r.distance}`));
      console.log(chalk.gray(`Metada: ${JSON.stringify(r.metadata)}`));
      console.log(chalk.gray(`Text: ${r.text}`));

  }
}        