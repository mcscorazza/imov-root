import type { Configuration, PopupRequest } from "@azure/msal-browser";

export const msalConfig: Configuration = {
  auth: {
    clientId: "473f42cb-a9f0-4871-b9ce-61ae485162a2",
    authority:
      "https://login.microsoftonline.com/309ed6ee-8839-4f96-8cb5-b24f9a5a7505",
    redirectUri: "http://localhost:5173/blank.html",
  },
  cache: {
    cacheLocation: "sessionStorage",
  },
};

export const loginRequest: PopupRequest = {
  scopes: ["User.Read"],
};
