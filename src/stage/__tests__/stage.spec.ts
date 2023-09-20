import { mockRequest } from "../../../jest.setup";
import { client } from "../__fixtures__/router";
import { stageSchema } from "../types";

describe(`stages`, () => {
  it(`createStageInstance`, async () => {
    const result = mockRequest.post(`/stage-instances`, stageSchema);
    const actual = await client.createStageInstance({
      body: {
        channelId: `foo`,
        topic: `bar`
      }
    });
    expect(actual).toStrictEqual(result);
  });

  it(`deleteStageInstance`, () => {
    mockRequest.delete(`/stage-instances/:channel`);
    expect(async () =>
      client.deleteStageInstance({
        channel: `foo`
      })
    ).not.toThrow();
  });

  it(`getStageInstance`, async () => {
    const result = mockRequest.get(`/stage-instances/:channel`, stageSchema);
    const actual = await client.getStageInstance({
      channel: `foo`
    });
    expect(actual).toStrictEqual(result);
  });

  it(`modifyStageInstance`, async () => {
    const result = mockRequest.patch(`/stage-instances/:channel`, stageSchema);
    const actual = await client.modifyStageInstance({
      channel: `foo`,
      body: {
        topic: `bar`
      }
    });
    expect(actual).toStrictEqual(result);
  });
});
