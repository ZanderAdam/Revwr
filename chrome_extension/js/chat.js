export class Chat {
  constructor(fileContainer) {
    this.fileContainer = fileContainer;
    this.chatMessages = this.createChatMessagesContainer();
    this.chatForm = this.createChatForm();
    this.spinner;
    this.messages = [];
  }

  createChatMessagesContainer() {
    const chatMessages = document.createElement('div');
    chatMessages.className = 'chat-messages';
    this.fileContainer.appendChild(chatMessages);
    return chatMessages;
  }

  createChatForm() {
    const chatForm = document.createElement('form');
    chatForm.id = 'chat-form';
    chatForm.autocomplete = 'off';
    chatForm.addEventListener('submit', (event) =>
      this.handleChatFormSubmit(event)
    );
    this.fileContainer.appendChild(chatForm);

    const chatInput = document.createElement('textarea');
    chatInput.className = 'chat-input';
    chatInput.setAttribute('placeholder', 'Type your message here...');
    chatInput.className = 'chat-input';
    chatForm.appendChild(chatInput);

    chatInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        chatForm.dispatchEvent(new Event('submit'));
      }
    });

    return chatForm;
  }

  addMessage(role, content) {
    this.messages.push({
      role,
      content,
    });

    if (this.messages.length === 1) {
      return;
    }

    this.createMessage(role, content);
  }

  addUserMessage(content) {
    this.addMessage('user', content);
  }

  addAssistantMessage(content) {
    this.addMessage('assistant', content);
  }

  createMessage(role, content) {
    const messageElem = document.createElement('div');
    messageElem.classList.add(...['message', `${role}-message`]);
    messageElem.innerHTML = marked.parse(content);
    this.chatMessages.appendChild(messageElem);

    this.chatMessages.scrollTop = this.chatMessages.scrollHeight;

    return messageElem;
  }

  async handleChatFormSubmit(event) {
    event.preventDefault();

    const input = this.chatForm.querySelector('.chat-input');
    const message = input.value.trim();
    if (!message) return;

    this.addUserMessage(message);
    input.value = '';

    this.submitChat();
  }

  start(file, selectedDiff) {
    const message = `
    ${file}
    \`\`\`
    ${selectedDiff}
    \`\`\``;

    this.addUserMessage(message);
    this.submitChat();
  }

  async submitChat() {
    const chatForm = this.chatForm.cloneNode(true);
    this.#showSpinner(this.chatForm);

    return fetch('http://localhost:3000/review', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: this.messages,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        const assistantResponse = data.response;
        this.addAssistantMessage(assistantResponse.content);
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        this.#hideSpinner();
      });
  }

  #showSpinner() {
    this.spinner = this.createMessage('assistant', '');
    this.spinner.appendChild(this.#createSpinner());
    this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
  }

  #hideSpinner() {
    this.chatMessages.removeChild(this.spinner);
  }

  #createSpinner() {
    const spinnerContainer = document.createElement('div');

    spinnerContainer.className = 'spinner-container';
    const spinner = document.createElement('div');
    spinner.className = 'spinner';

    for (let i = 0; i < 3; i++) {
      const dot = document.createElement('div');
      spinner.appendChild(dot);
    }

    spinnerContainer.appendChild(spinner);

    return spinnerContainer;
  }
}
