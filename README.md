# Prompter CLI

Prompter CLI is a command line tool for managing prompts, bots, and embeddings.

## Install

```bash
npm install -g prompter-cli
```

## Usage

Verify the installation by running `prompter --version` in your terminal.

```bash
prompter --version
```

### Login

Login to your Prompter account by running `prompter login` in your terminal.

```bash
prompter login
```

### Publish a prompt

Publish a prompt by running `prompter --prompt=<prompt> --publish` in your terminal. Note that the prompt must be a valid Handlebars template. See [Handlebars](https://handlebarsjs.com/) for more information.
If no promptId is provided, the file name will be used as the promptId. If the prompt is already published, it will be updated.

```bash
 prompter --prompt=demo.hbr --publish
 ```

 Publish using a different promptId:

 ```bash
    prompter --prompt=demo.hbr --id=demo --publish
```

### Uploading Embeddings

Embeddings can be uploaded by running ```prompter --embed=<file> --collection=<collection-name> ``` in your terminal. Embeddings must be a text file, it supports Mark Down and Json.

you can specifiy chunkSize by running ```prompter --embed=<file> --collection=<collection-name> --chunkSize=<chunkSize>``` in your terminal. The default chunkSize is 1000.

### Querying Embeddings

Execute ```prompter``` then select Embeddings from menu.
