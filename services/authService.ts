// This is a simulated service. In a real application, the JWT would be sent
// to a secure backend server for verification and decoding.
// We are decoding it on the client side for demonstration purposes only.

interface GoogleUser {
  email: string;
  name: string;
  picture: string;
}

export interface Session {
  isAuthenticated: true;
  isGodMode: boolean;
  user: GoogleUser;
}

const GOD_MODE_EMAIL = 'arturcreativegroup@gmail.com';

// Basic JWT decoding (for demonstration only, NOT for production)
const decodeJwt = (token: string): any => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Failed to decode JWT:", error);
    return null;
  }
};

export const authService = {
  verifyGoogleCredential: (credential: string): Session | null => {
    const payload = decodeJwt(credential);

    if (!payload || !payload.email) {
      console.error("Invalid JWT payload from Google.");
      return null;
    }
    
    const user: GoogleUser = {
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
    };

    const isGodMode = user.email === GOD_MODE_EMAIL;

    return {
      isAuthenticated: true,
      isGodMode,
      user,
    };
  },
};
