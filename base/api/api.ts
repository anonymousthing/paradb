import {
  deserializeFindMapsResponse,
  deserializeGetMapResponse,
  deserializeLoginResponse,
  deserializeSignupResponse,
  FindMapsResponse,
  GetMapRequest,
  GetMapResponse,
  LoginRequest,
  LoginResponse,
  SignupRequest,
  SignupResponse,
  User,
} from 'paradb-api-schema';

export interface Api {
  /* Auth */
  login(req: LoginRequest): Promise<LoginResponse>;
  signup(req: SignupRequest): Promise<SignupResponse>;

  /* User */
  getMe(): Promise<User>;

  /* Maps */
  findMaps(): Promise<FindMapsResponse>;
  getMap(req: GetMapRequest): Promise<GetMapResponse>;
}

export class HttpApi implements Api {
  private apiBase = '/api'

  async login(req: LoginRequest): Promise<LoginResponse> {
    const resp = await post(path(this.apiBase, 'users', 'login'), req);
    return deserializeLoginResponse(resp);
  }

  async signup(req: SignupRequest): Promise<SignupResponse> {
    const resp = await post(path(this.apiBase, 'users', 'signup'), req);
    return deserializeSignupResponse(resp);
  }

  async getMe(): Promise<User> {
    const resp = await get(path(this.apiBase, 'users', 'me'));
    if (!resp.success) {
      throw new Error();
    }
    return resp.user;
  }

  async findMaps(): Promise<FindMapsResponse> {
    const resp = await get(path(this.apiBase, 'maps'));
    return deserializeFindMapsResponse(resp);
  }

  async getMap(req: GetMapRequest): Promise<GetMapResponse> {
    const resp = await get(path(this.apiBase, `maps/${req.id}`));
    return deserializeGetMapResponse(resp);
  }
}

function path(...parts: string[]) {
  return [
    ...parts.slice(0, parts.length - 1).map((part, i) => part.endsWith('/') ? part : `${part}/`),
    parts[parts.length - 1]
  ].join('');
}

const xssiPrefix = '\'"])}while(1);</x>//';
async function get(path: string): Promise<any> {
  const resp = await fetch(path);
  const text = await resp.text();
  return JSON.parse(text.substr(xssiPrefix.length));
}
async function post(path: string, body: object): Promise<any> {
  const resp = await fetch(path, {
    method: 'POST',
    headers: {
      ['Content-Type']: 'application/json',
    },
    body: JSON.stringify(body),
  });
  const text = await resp.text();
  return JSON.parse(text.substr(xssiPrefix.length));
}
