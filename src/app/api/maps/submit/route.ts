import { getBody } from 'app/api/helpers';
import { NextRequest, NextResponse } from 'next/server';
import {
  SubmitMapResponse,
  deserializeSubmitMapRequest,
  serializeSubmitMapResponse,
} from 'schema/maps';
import { getEnvVars } from 'services/env';
import { error } from 'services/helpers';
import { submitErrorMap } from 'services/maps/maps_repo';
import { getServerContext } from 'services/server_context';
import { getUserSession } from 'services/session/session';

const send = (res: SubmitMapResponse) => new NextResponse<Buffer>(serializeSubmitMapResponse(res));
export async function POST(req: NextRequest): Promise<NextResponse<Buffer>> {
  const user = await getUserSession();
  if (!user) {
    return error({
      statusCode: 403,
      message: 'You must be logged in to submit maps.',
      errorBody: {},
      errorSerializer: serializeSubmitMapResponse,
    });
  }

  const submitMapReq = await getBody(req, deserializeSubmitMapRequest);

  if (submitMapReq.mapData.byteLength > 1024 * 1024 * 40) {
    // 40MiB. We use MiB because that's what Windows displays in Explorer and therefore what users will expect.
    return error({
      statusCode: 400,
      message: 'File is over the filesize limit (40MB)',
      errorBody: {},
      errorSerializer: serializeSubmitMapResponse,
    });
  }

  const { mapsRepo } = await getServerContext();
  if (submitMapReq.id) {
    const mapResult = await mapsRepo.getMap(submitMapReq.id);
    if (!mapResult.success) {
      return error({
        statusCode: 404,
        message: `Could not find specified map to resubmit: ${submitMapReq.id}`,
        errorBody: {},
        errorSerializer: serializeSubmitMapResponse,
      });
    }
    if (mapResult.value.uploader !== user.id) {
      return error({
        statusCode: 403,
        message: `Not authorized to modify the specified map: ${submitMapReq.id}`,
        errorBody: {},
        errorSerializer: serializeSubmitMapResponse,
      });
    }
  }

  const submitMapResult = await mapsRepo.upsertMap(getEnvVars().mapsDir, {
    id: submitMapReq.id,
    uploader: user.id,
    mapFile: submitMapReq.mapData,
  });
  if (!submitMapResult.success) {
    // TODO: report all errors back to the client and not just the first one
    const [statusCode, message] = submitErrorMap[submitMapResult.errors[0].type];
    return error({
      statusCode,
      message,
      errorBody: {},
      errorSerializer: serializeSubmitMapResponse,
      resultError: submitMapResult,
    });
  }
  return send({ success: true, id: submitMapResult.value.id });
}
