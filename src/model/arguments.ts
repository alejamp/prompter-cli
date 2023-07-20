import { parse } from 'ts-command-line-args';

export interface IPrompterArguments {
    prompt?: string;
    publish?: boolean;
    help?: boolean
    id?: string;
    desc?: string;
    version?: boolean;
    auth?: boolean;
    embed?: string;
    chunkSize?: number;
    collection?: string;
 }


 export function processArgs() {
    return parse<IPrompterArguments>(
        {
            collection: {
                type: String,
                description: 'Collection name to store the file. Example: --collection my-collection. By default the collection name is the file name.',
                optional: true
            },
            chunkSize: {
                type: Number,
                description: 'Chunk size in tokens to split the file into. Default is 1000. Example: --chunkSize 1000. ',
                optional: true
            },
            embed: {
                type: String,
                description: 'Embed a text data file into a semantic store. It performs an upsert operation. Example: --embed my-data.txt',
                optional: true
            },
            auth: {
                type: Boolean,
                description: 'Auth using your token.',
                optional: true
            },
            prompt: {
                type: String,
                alias: 'P',
                description: 'Prompt file to publish. Example: my-prompt.prompt or just my-prompt',
                optional: true
            },
            publish: { 
                type: Boolean, 
                alias: 'A', 
                description: 'Publish the prompt using promptId, by default promptId is the prompt file name.',
                optional: true
            },
            help: {
                type: Boolean,
                alias: 'H',
                description: 'Prints this usage guide.',
                optional: true
            },
            id: {
                type: String,
                alias: 'I',
                description: 'Prompt Id, by default promptId is the prompt file name.',
                optional: true
            },
            desc: {
                type: String,
                alias: 'D',
                description: 'Prompt description.',
                // defaultValue: 'Uploaded using prompter-cli',
                optional: true
            },
            version: {
                type: Boolean,
                alias: 'V',
                description: 'Prints the version of prompter-cli.',
                optional: true
            }
        },
        {
            helpArg: 'help',
            headerContentSections: [{ header: 'Prompter CLI', content: 'Thanks for using Lola Prompter Library' }],
            footerContentSections: [{ header: 'Authors', content: `by alejandro@leapfinancial.com\nCopyright: Leapfinancial inc.` }],
        },    
    );    
 }