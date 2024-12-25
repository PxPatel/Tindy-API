import { Request, Response } from "express";
import generateRandomString from "../../../util/generateRandomString";
import "dotenv/config.js";

/**
 * @name userAuth
 * @slugs
 *
 */
export const userAuth = async (req: Request, res: Response): Promise<void> => {
    const state = generateRandomString(16);
    const scope =
        "playlist-modify-private playlist-modify-public user-top-read user-read-email user-read-private";

    const params = new URLSearchParams({
        response_type: "code",
        client_id: process.env.SPOTIFY_CLIENT_ID,
        scope: scope,
        redirect_uri: process.env.REDIRECT_URI,
        state: state,
    });

    const spotifyAuthUrl = `https://accounts.spotify.com/authorize?${params.toString()}`;

    res.redirect(spotifyAuthUrl);
};
