import { mockRequest } from "../../../jest.setup";
import { messageSchema } from "../../channel";
import { client } from "../__fixtures__/router";
import { webhookSchema } from "../types";

describe(`webhooks`, () => {
  it(`createWebhook`, async () => {
    const result = mockRequest.post(
      `/channels/:channel/webhooks`,
      webhookSchema
    );
    const actual = await client.createWebhook({
      channel: `channelID`,
      body: {
        name: `webhook name`
      }
    });
    expect(actual).toStrictEqual(result);
  });

  it(`deleteWebhook`, () => {
    mockRequest.delete(`/webhooks/:webhook`);
    expect(async () =>
      client.deleteWebhook({
        webhook: `webhookID`
      })
    ).not.toThrow();
  });

  it(`deleteWebhookMessage`, () => {
    mockRequest.delete(`/webhooks/:webhook/:token/messages/:message`);
    expect(async () =>
      client.deleteWebhookMessage({
        webhook: `webhookID`,
        token: `accessToken`,
        message: `messageID`
      })
    ).not.toThrow();
  });

  it(`deleteWebhookWithToken`, () => {
    mockRequest.delete(`/webhooks/:webhook/:token`);
    expect(async () =>
      client.deleteWebhookWithToken({
        webhook: `webhookID`,
        token: `accessToken`
      })
    ).not.toThrow();
  });

  it(`editWebhookMessage`, async () => {
    const result = mockRequest.patch(
      `/webhooks/:webhook/:token/messages/:message`,
      messageSchema
    );
    const actual = await client.editWebhookMessage({
      webhook: `webhookID`,
      token: `accessToken`,
      message: `messageID`,
      body: {
        content: `new message content`
      }
    });
    expect(actual).toStrictEqual(result);
  });

  it(`executeGitHubCompatibleWebhook`, () => {
    mockRequest.post(`/webhooks/:webhook/:token/github`);
    expect(async () =>
      client.executeGitHubCompatibleWebhook({
        webhook: `webhookID`,
        token: `accessToken`
      })
    ).not.toThrow();
  });

  it(`executeSlackCompatibleWebhook`, () => {
    mockRequest.post(`/webhooks/:webhook/:token/slack`);
    expect(async () =>
      client.executeSlackCompatibleWebhook({
        webhook: `webhookID`,
        token: `accessToken`
      })
    ).not.toThrow();
  });

  it(`executeWebhook`, () => {
    mockRequest.post(`/webhooks/:webhook/:token`);
    expect(async () =>
      client.executeWebhook({
        webhook: `webhookID`,
        token: `accessToken`,
        body: {
          content: `webhook message content`
        }
      })
    ).not.toThrow();
  });

  it(`getChannelWebhooks`, async () => {
    const result = mockRequest.get(
      `/channels/:channel/webhooks`,
      webhookSchema.array()
    );
    const actual = await client.getChannelWebhooks({
      channel: `channelID`
    });
    expect(actual).toStrictEqual(result);
  });

  it(`getGuildWebhooks`, async () => {
    const result = mockRequest.get(
      `/guilds/:guild/webhooks`,
      webhookSchema.array()
    );
    const actual = await client.getGuildWebhooks({
      guild: `guildID`
    });
    expect(actual).toStrictEqual(result);
  });

  it(`getWebhook`, async () => {
    const result = mockRequest.get(`/webhooks/:webhook`, webhookSchema);
    const actual = await client.getWebhook({
      webhook: `webhookID`
    });
    expect(actual).toStrictEqual(result);
  });

  it(`getWebhookMessage`, async () => {
    const result = mockRequest.get(
      `/webhooks/:webhook/:token/messages/:message`,
      messageSchema
    );
    const actual = await client.getWebhookMessage({
      webhook: `webhookID`,
      token: `accessToken`,
      message: `messageID`
    });
    expect(actual).toStrictEqual(result);
  });

  it(`getWebhookWithToken`, async () => {
    const result = mockRequest.get(`/webhooks/:webhook/:token`, webhookSchema);
    const actual = await client.getWebhookWithToken({
      webhook: `webhookID`,
      token: `accessToken`
    });
    expect(actual).toStrictEqual(result);
  });

  it(`modifyWebhook`, async () => {
    const result = mockRequest.patch(`/webhooks/:webhook`, webhookSchema);
    const actual = await client.modifyWebhook({
      webhook: `webhookID`,
      token: `accessToken`,
      body: {
        name: `new webhook name`
      }
    });
    expect(actual).toStrictEqual(result);
  });

  it(`modifyWebhookWithToken`, async () => {
    const result = mockRequest.patch(
      `/webhooks/:webhook/:token`,
      webhookSchema
    );
    const actual = await client.modifyWebhookWithToken({
      webhook: `webhookID`,
      token: `accessToken`,
      body: {
        name: `new webhook name`
      }
    });
    expect(actual).toStrictEqual(result);
  });
});
