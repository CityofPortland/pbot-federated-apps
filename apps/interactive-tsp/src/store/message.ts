import { defineStore } from 'pinia';

export interface Message {
  id: string;
  type: 'error' | 'warning' | 'info';
  text: string;
  dismissible: boolean;
}

function initialAlerts(): Message[] {
  const alerts = new Array<Message>();
  const ua = window.navigator.userAgent;

  // Detect if IE <= 11, add message if detected
  if (ua.indexOf('Trident/') > 0 || ua.indexOf('MSIE ') > 0) {
    alerts.push({
      id: 'unsupported-browser',
      type: 'error',
      text: 'You are using an unsupported browser. Features of this application will not function. Please use a different browser.',
      dismissible: false,
    });
  }

  return alerts;
}

export const useMessageStore = defineStore('message', {
  state: () => ({
    alerts: initialAlerts(),
    messages: new Array<Message>(),
  }),
  actions: {
    clearMessages() {
      this.messages = [];
    },
    addMessage(message: Message) {
      const i = this.messages.findIndex(value => value.id === message.id);
      if (i === -1) this.messages.push(message);
    },
    removeMessage(id: string) {
      const i = this.messages.findIndex(value => value.id === id);
      if (i !== -1) this.messages.splice(i, 1);
    },
  },
});
