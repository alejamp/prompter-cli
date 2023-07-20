import { Separator, input, select } from '@inquirer/prompts';



console.log("Prompter is running...");


export async function mainMenu() {
    return await select({
        message: 'Select a package manager',
        choices: [
          {
            name: 'npm',
            value: 'npm',
            description: 'npm is the most popular package manager',
          },
          {
            name: 'yarn',
            value: 'yarn',
            description: 'yarn is an awesome package manager',
          },
          new Separator(),
          {
            name: 'jspm',
            value: 'jspm',
            disabled: true,
          },
          {
            name: 'pnpm',
            value: 'pnpm',
            disabled: '(pnpm is not available)',
          },
        ],
      });
}


mainMenu().then((answers) => {
    console.log(answers);
}
).catch((error) => {
    console.error(error);
});