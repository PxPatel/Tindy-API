import { Request, Response } from "express";
import { spotifyFetchCall } from "../../../util/spotifyFetchCall";
import "dotenv/config.js";
import { db } from "../../../firebase/initialize";
import { doc, setDoc } from "firebase/firestore";

/**
 * @name accessToken
 * @slugs
 *
 */
export const accessToken = async (
    req: Request,
    res: Response,
): Promise<void> => {
    const authCode = (req.query.code as string) ?? "";
    const error = (req.query.error as string) ?? null;

    if (error) {
        res.status(400).send({
            error: "Authentication Failed",
            message: error,
        });
    }

    try {
        const spotifyTokenURL = new URL(
            "https://accounts.spotify.com/api/token",
        );

        // Use `.toString()` to convert `URLSearchParams` to a query string
        spotifyTokenURL.search = new URLSearchParams({
            grant_type: "authorization_code",
            code: authCode,
            redirect_uri: process.env.REDIRECT_URI,
            client_id: process.env.SPOTIFY_CLIENT_ID,
            client_secret: process.env.SPOTIFY_CLIENT_SECRET,
        }).toString();

        // Use the utility function to handle fetching, errors, and response
        const { data, status, contentType } = await spotifyFetchCall(
            new Request(spotifyTokenURL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            }),
        );

        const { data: profile } = await spotifyFetchCall(
            new Request("https://api.spotify.com/v1/me", {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${data.access_token}`,
                },
            }),
        );

        // Save the access_token and refresh_token into Firestore
        await setDoc(doc(db, "sessions", profile.email), {
            access_token: data.access_token,
            refresh_token: data.refresh_token,
        });
    } catch (e) {
        console.error(e);
        res.status(500).send({
            error: "Internal Server Error",
            message: e.message,
        });
    }
};
