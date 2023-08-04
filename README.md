
<p align="center">
  <img src="https://firebasestorage.googleapis.com/v0/b/numichat.appspot.com/o/Perf_Lola%2BH.way%20banner.png?alt=media&token=8a0dac42-1f76-4754-ac9c-40a93ba02125" alt="Logo">
</p>


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

### Uploading Plain Text Embeddings

Create a text file with extension .txt then follow the instructions below.
Embeddings can be uploaded by running ```prompter --embed=<file> --collection=<collection-name> ``` in your terminal. Embeddings must be a text file, it supports Mark Down and Json.

you can specifiy chunkSize by running ```prompter --embed=<file> --collection=<collection-name> --chunkSize=<chunkSize>``` in your terminal. The default chunkSize is 1000.

### Uploading Markdown Embeddings

Create a text file with extension .md then follow the instructions below.
Embeddings can be uploaded by running ```prompter --embed=<file> --collection=<collection-name>``` in your terminal. Embeddings must be a text file with extension .md. Prompter will detect the file extension and upload the embeddings as markdown.

Additional parameters can be specified by running ```prompter --embed=<file> --splitTables=true``` in your terminal.
In Markdown, tables are represented as text. Prompter will detect tables and split them into separate chunks keeping a copy of the header in each chunk. This is useful for creating a table of contents.

In markdown, the chunk split criteria is praragraphs, each paragraph will be a separate chunk, keeping a breadcrumb of the parent headlines on each chunk.

### Querying Embeddings

Execute ```prompter``` then select Embeddings from menu.
