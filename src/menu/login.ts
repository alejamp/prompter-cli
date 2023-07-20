
import { input } from '@inquirer/prompts';
import { login } from '../api.js';
import chalk from 'chalk';
import { Store } from '../store.js';


export async function doLogin() {
    
    const username = await input({ message: 'Enter your username/email:' });
    const password = await input({ message: 'Password:' });

    try {
        const token = await login(username, password);
        console.log(`Token: ${token}`);

        // save token
        const store = new Store();
        store.setToken(token).then(() => {
            console.log(chalk.green(`Login successful!!! Welcome ${username}`));
        }).catch((err) => {
            console.error(chalk.red(`Error saving token: ${err}`));
        });
    }
    catch (err: any) {
        // console.error(err);
        console.error(`Error: ${err?.message ?? 'Unknown error'}`);
        console.log(chalk.red(`Login failed.`));
    }
}

export async function doLogout() {
    const store = new Store();
    try {
        await store.setToken('');
        console.log(chalk.green(`Logout successful!!!`));
    } catch (err) {
        console.error(chalk.red(`Error saving token: ${err}`));
    }
}