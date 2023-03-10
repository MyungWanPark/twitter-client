export default class AuthService {
  constructor(http) {
    this.http = http;
  }

  async csrfToken() {
    const response = await this.http.fetch('/auth/csrf-token', {
      method: 'GET',
    });
    return response.csrfToken;
  }

  async signup(username, password, name, email, url) {
    return this.http.fetch('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        username,
        password,
        email,
        name,
        url,
      }),
    });
  }

  async login(username, password) {
    return this.http.fetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        username,
        password,
      }),
    });
  }

  async me() {
    return this.http.fetch('/auth/me', {
      method: 'GET',
    });
  }

  async logout() {
    return this.http.fetch('/auth/logout', {
      method: 'POST',
    });
  }
}
