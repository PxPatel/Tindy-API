import { Router } from "express";
import { accessToken } from "../controllers/api/v1/accessToken";
import { userAuth } from "../controllers/api/v1/userAuth";
import { refreshToken } from "../controllers/api/v1/refreshToken";
import { topTracks } from "../controllers/api/v1/topTracks";

// base route: /api/v1
const index = Router();

// api/v1/accessToken
index.get("/accessToken", accessToken);

// api/v1/userAuth
index.get("/userAuth", userAuth);

// api/v1/refreshToken
index.get("/refreshToken", refreshToken);

// api/v1/userAuth
index.get("/topTracks", topTracks);

export { index as v1 };
