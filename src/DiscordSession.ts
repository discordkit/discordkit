export const endpoint = `https://discord.com/api/v10/`;

/** @internal */
export class DiscordSession {
  endpoint: string = endpoint;
  #authToken: string | null = null;
  get ready(): boolean {
    return Boolean(this.#authToken);
  }

  constructor(authToken?: string | null) {
    if (authToken) {
      this.setToken(authToken);
    }
  }

  /**
   * Clears the current session details, then attempts to set
   * new session values
   */
  setToken = (token: string): void => {
    this.#authToken = null;
    if (!token) {
      throw new Error(`Must provide a non-empty string to set Auth Token`);
    }
    if (!token.startsWith(`Bot `) && !token.startsWith(`Bearer `)) {
      throw new Error(
        `Token must begin with either "Bot " or "Bearer ", received: ${token}`
      );
    }
    this.#authToken = token;
  };

  clearSession = (): void => {
    this.#authToken = null;
  };

  getSession = (): string => {
    const token = this.#authToken;

    if (!token) {
      throw new Error(`Auth Token must be set before requests can be made.`);
    }

    return token;
  };
}

export const discord = new DiscordSession();
