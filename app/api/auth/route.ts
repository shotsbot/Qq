import { NextResponse } from "next/server";

// VPS portal admin accounts
const USERS_DB = [
  { username: "RiSET", password: "Asdwe1234", role: "admin", label: "RiSET Administrator" },
  { username: "admin", password: "adminvpspassword123", role: "admin", label: "System Administrator" },
  { username: "operator", password: "operatorpassword456", role: "operator", label: "DevOps Engineer / Contributor" },
];

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ success: false, error: "Username dan password diperlukan!" }, { status: 400 });
    }

    const user = USERS_DB.find(
      (u) => u.username.toLowerCase() === username.toLowerCase() && u.password === password
    );

    if (!user) {
      return NextResponse.json({ success: false, error: "Username atau sandikunci salah!" }, { status: 401 });
    }

    // Creating a session info payload to mimic JWT sign
    const fakeToken = btoa(JSON.stringify({
      username: user.username,
      role: user.role,
      label: user.label,
      exp: Date.now() + 24 * 60 * 60 * 1000 // 24 hours expiry
    }));

    const response = NextResponse.json({
      success: true,
      token: fakeToken,
      user: {
        username: user.username,
        role: user.role,
        label: user.label
      }
    });

    // Set cookie
    response.cookies.set("vps_auth_session", fakeToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ success: false, error: "Kesalahan server internal" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  // Session verification endpoint
  try {
    const authHeader = req.headers.get("Authorization");
    let token = "";

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }

    if (!token) {
      const cookieHeader = req.headers.get("cookie");
      const match = cookieHeader?.match(/vps_auth_session=([^;]+)/);
      if (match) {
        token = match[1];
      }
    }

    if (!token) {
      return NextResponse.json({ success: false, isAuthenticated: false, error: "Sesi tidak ditemukan" }, { status: 401 });
    }

    const sessionData = JSON.parse(atob(token));
    if (sessionData.exp < Date.now()) {
      return NextResponse.json({ success: false, isAuthenticated: false, error: "Sesi telah kedaluwarsa" }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      isAuthenticated: true,
      user: {
        username: sessionData.username,
        role: sessionData.role,
        label: sessionData.label
      }
    });
  } catch (err) {
    return NextResponse.json({ success: false, isAuthenticated: false, error: "Sesi tidak valid" }, { status: 401 });
  }
}
