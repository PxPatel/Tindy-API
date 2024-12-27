import { Request, Response } from "express";
import { spotifyFetchCall } from "../../../util/spotifyFetchCall";
import "dotenv/config.js";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../firebase/initialize";

/**
 * @name topTracks
 * @slugs
 *
 */
export const topTracks = async (req: Request, res: Response): Promise<void> => {
    const email = req.query.email as string;

    try {
        // Fetch the document from Firestore
        const userDoc = await getDoc(doc(db, "sessions", email));

        if (!userDoc.exists()) {
            res.status(404).send({ error: "User not found" });
            return;
        }

        const userData = userDoc.data();
        const accessToken = userData.access_token;

        const UserTopItemURL = new URL(
            "https://api.spotify.com/v1/me/top/tracks",
        );

        // Use `.toString()` to convert `URLSearchParams` to a query string
        UserTopItemURL.search = new URLSearchParams({
            limit: "10",
        }).toString();

        // Use the utility function to handle fetching, errors, and response
        const { data, status, contentType } = await spotifyFetchCall(
            new Request(UserTopItemURL, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }),
        );

        res.send({ data, status, contentType });
    } catch (e) {
        console.error(e);
        res.status(500).send({
            error: "Internal Server Error",
            message: e.message,
        });
    }
};
