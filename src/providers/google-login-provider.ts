import {BaseLoginProvider} from '../entities/base-login-provider';
import {SocialUser, LoginProviderClass} from '../entities/user';

declare let gapi: any;

export class GoogleLoginProvider extends BaseLoginProvider {

    public static readonly PROVIDER_ID = 'google';
    public loginProviderObj: LoginProviderClass = new LoginProviderClass();
    private auth2: any;

    constructor(private clientId: string) {
        super();
        this.loginProviderObj.id = clientId;
        this.loginProviderObj.name = 'google';
        this.loginProviderObj.url = 'https://apis.google.com/js/platform.js';
    }

    initialize(): Promise<SocialUser> {
        return new Promise((resolve, reject) => {
            this.loadScript(this.loginProviderObj, () => {
                gapi.load('auth2', () => {
                    this.auth2 = gapi.auth2.init({
                        client_id: this.clientId,
                        scope: 'email profile openid https://www.googleapis.com/auth/gmail.send'
                    });

                    this.auth2.then(() => {
                        if (this.auth2.isSignedIn.get()) {
                            this.auth2.currentUser.get().reloadAuthResponse().then(authResponse => {
                                resolve(this.drawUser(null, authResponse));
                            });
                        }
                    });
                });
            });
        });
    }

    drawUser(googleAuthCode?: string, authResponse?: any): SocialUser {
        let user: SocialUser = new SocialUser();
        let profile = this.auth2.currentUser.get().getBasicProfile();
        let authResponseObj = authResponse ? authResponse : this.auth2.currentUser.get().getAuthResponse(true);
        user.id = profile.getId();
        user.name = profile.getName();
        user.email = profile.getEmail();
        user.image = profile.getImageUrl();
        user.token = authResponseObj.access_token;
        user.idToken = authResponseObj.id_token;
        user.expireAt = authResponseObj.expires_at;
        user.expireIn = authResponseObj.expires_in;
        user.code = googleAuthCode;
        return user;
    }

    signIn(): Promise<SocialUser> {
        return new Promise((resolve, reject) => {
            let promise = this.auth2.grantOfflineAccess({
                prompt: 'select_account'
            });
            promise.then((resp) => {
                this.auth2.currentUser.get().reloadAuthResponse().then(authResponse => {
                    resolve(this.drawUser(resp.code, authResponse));
                });
            });
        });
    }

    signOut(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.auth2.signOut().then((err: any) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

}
