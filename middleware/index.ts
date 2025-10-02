import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies"


export async function middleware(req: NextRequest) {
	const session = await getSessionCookie(req);
	if (!session) {
		return NextResponse.redirect(new URL("/sign-in", req.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|sign-in|sign-up|assets).*)',
    ],
}
