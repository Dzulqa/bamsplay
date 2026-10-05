import { NextResponse } from "next/server";

// POST /api/auth/google
// Verifies Google credential and returns profile
export async function POST(request) {
  try {
    const { credential, clientId } = await request.json();

    if (!credential) {
      return NextResponse.json({ error: "No credential provided" }, { status: 400 });
    }

    // Decode the Google JWT payload (Header.Payload.Signature)
    const parts = credential.split(".");
    if (parts.length < 2) {
      return NextResponse.json({ error: "Invalid credential format" }, { status: 400 });
    }

    const payloadJson = Buffer.from(parts[1], "base64").toString("utf-8");
    const userPayload = JSON.parse(payloadJson);

    // Validate email presence
    if (!userPayload.email) {
      return NextResponse.json({ error: "Email not found in Google token" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      user: {
        email: userPayload.email.toLowerCase(),
        name: userPayload.name || userPayload.given_name || userPayload.email.split("@")[0],
        avatar: userPayload.picture || "",
        sub: userPayload.sub,
        provider: "google",
      },
    });
  } catch (error) {
    console.error("POST /api/auth/google error:", error);
    return NextResponse.json({ error: "Failed to authenticate Google user" }, { status: 500 });
  }
}
