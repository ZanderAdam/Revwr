## Overview

The Revwr is a Chrome extension that provides an interactive chat interface for users to get explanations for code differences (diffs) within a codebase during a pull request review on GitHub. The extension allows users to select specific lines or an entire file to receive explanations, making it easier to understand changes in the code. The extension communicates with a server component, which uses OpenAI's GPT-3.5 Turbo model to generate responses based on the user's queries.

[See it in action](https://www.loom.com/share/c9d12d34429048ca9ad164c4f84cbf5f)

## Features
- Interactive chat interface for easy communication
- Support for explaining selected lines, entire files, or all diffs in a pull request
- Seamless integration with GitHub's pull request review interface
- Backend server component that leverages OpenAI's GPT-3.5 Turbo model

## Setup Instructions
### Chrome Extension
1. Navigate to the `chrome_extension` folder in the repository.
2. In Chrome, go to `chrome://extensions/`.
3. Toggle on the "Developer mode" switch in the top-right corner of the extensions page.
4. Click the "Load unpacked" button and select the `chrome_extension` folder.
5. The Code Review Assistant extension should now be installed and ready to use on GitHub pull requests.

### Server Component
1. Ensure you have Node.js installed on your system.
2. Navigate to the `server` folder in the repository.
3. Run the following command to install the required dependencies:

```bash
npm install
```

4. Create a `.env` file in the `server` folder and add the following content:

```ini
OPENAI_API_KEY=your_openai_api_key_here
PORT=3000
NODE_ENV=test
```
Replace `your_openai_api_key_here` with your actual OpenAI API key. The `NODE_ENV` variable can be set to `test` for test mode or left unset for normal operation.
5. In the `chrome_extension` folder, locate the `submitChat()` function in the `js/chat.js` file and update the server URL (currently `http://localhost:3000/review`) to match your server's address and port, if necessary.
6. Start the server by running `node server.js` from the `server` folder. The server should now be running and ready to process chat requests from the extension.
With both the Chrome extension and server component set up, the Code Review Assistant is ready to use on GitHub pull requests.

## How to Use the Revwr Extension

1. After successfully installing the Revwr Chrome extension and setting up the server component, navigate to a pull request and go to "Files changed" tab.
2. Click the Revwr extension button in the Chrome toolbar to open the extension in a sidebar. The sidebar will display a list of all files in the pull request, with an "Explain" button under each file.
3. To get an explanation of a specific file, click the "Explain" button under the file's name. The chat interface will open, and the AI assistant will provide an explanation of the file's changes.
4. To get an explanation of selected lines, highlight the desired lines in the pull request by clicking on the line numbers. Then, click the "Explain Selected" button in the Revwr sidebar. The chat interface will open, and the AI assistant will provide an explanation of the selected lines.
5. To get an explanation of all the files in the pull request, click the "Explain All" button in the Revwr sidebar. The chat interface will open, and the AI assistant will provide explanations for all the files' changes.
6. If you need further clarification or have additional questions, continue the conversation with the AI assistant in the chat interface.
7. When you're satisfied with the explanations provided, click the "Close" button or click on the extension button again.


This README was mostly autogenerated by ChatGPT (except for the loom link). The future is now!