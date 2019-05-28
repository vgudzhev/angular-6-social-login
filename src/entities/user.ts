export class SocialUser {
  provider: string;
  id: string;
  email: string;
  name: string;
  image: string;
  token?: string;
  idToken?: string;
  expireIn?: string;
  expireAt?: string;
}

export class LoginProviderClass {
  name: string;
  id: string;
  url: string;
}

export class LinkedInResponse {
  emailAddress: string;
  firstName: string;
  id: string;
  lastName: string;
  pictureUrl: string;
}
