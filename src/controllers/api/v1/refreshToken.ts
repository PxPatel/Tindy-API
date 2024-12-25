import { Request, Response } from "express";
import { spotifyFetchCall } from "../../../util/spotifyFetchCall";
import "dotenv/config.js";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebase/initialize";

/**
 * @name refreshToken
 * @slugs
 *
 */
export const refreshToken = async (
    req: Request,
    res: Response,
): Promise<void> => {
    const email = req.query.email as string;

    try {
        // Fetch the document from Firestore
        const userDoc = await getDoc(doc(db, "sessions", email));

        if (!userDoc.exists()) {
            res.status(404).send({ error: "User not found" });
            return;
        }

        const userData = userDoc.data();
        const refreshToken = userData.refresh_token;

        const spotifyTokenURL = new URL(
            "https://accounts.spotify.com/api/token",
        );

        // Use `.toString()` to convert `URLSearchParams` to a query string
        spotifyTokenURL.search = new URLSearchParams({
            grant_type: "refresh_token",
            client_id: process.env.SPOTIFY_CLIENT_ID,
            refresh_token: refreshToken,
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

        // Update the access_token in Firestore
        await updateDoc(doc(db, "sessions", email), {
            access_token: data.access_token,
        });
    } catch (e) {
        console.error(e);
        res.status(500).send({
            error: "Internal Server Error",
            message: e.message,
        });
    }
};
