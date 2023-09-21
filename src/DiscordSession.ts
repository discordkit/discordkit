export const endpoint = `https://discord.com/api/v10/`;

export class DiscordSession {
  endpoint: string = endpoint;
  #authToken: string | null = null;
  #bot: boolean = false;
  get ready(): boolean {
    return Boolean(this.#authToken);
  }

  constructor(authToken?: string | null, bot?: boolean) {
    if (authToken) {
      this.#authToken = authToken;
    }
    if (bot) {
      this.#bot = bot;
    }
  }

  // eslint-disable-next-line accessor-pairs
  set setToken(token: string) {
    if (!token) {
      throw new Error(`Must provide a non-empty string to set Auth Token`);
    }

    if (this.ready) {
      throw new Error(`Auth token already configured!`);
    }

    this.#authToken = token;
  }

  clearSession = (): void => {
    this.#authToken = null;
    this.#bot = false;
  };

  getSession = (): string => {
    const token = this.#authToken;

    if (!token) {
      throw new Error(`Auth Token must be set before requests can be made.`);
    }

    return `${this.#bot ? `Bot` : `Bearer`} ${token}`;
  };
}

const botToken = process.env.DISCORD_BOT_AUTH_TOKEN;

export const discord = new DiscordSession(botToken, Boolean(botToken));
