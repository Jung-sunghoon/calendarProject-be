function getGoogleOauthURL() {
  const googleAuthURL = "https://accounts.google.com/o/oauth2/v2/auth";
  const params = new URLSearchParams({
    redirect_uri: process.env.REDIRECT_URI,
    client_id: process.env.CLIENT_ID,
    access_type: "offline",
    response_type: "code",
    prompt: "consent",
    scope: ["https://www.googleapis.com/auth/userinfo.profile", "https://www.googleapis.com/auth/userinfo.email"].join(
      " "
    ),
  });

  return `${googleAuthURL}?${params.toString()}`;
}

async function getGoogleUser(code) {
  // 액세스 토큰 요청
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      code,
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      redirect_uri: process.env.REDIRECT_URI,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenResponse.ok) {
    throw new Error(`HTTP error! status: ${tokenResponse.status}`);
  }

  const tokenData = await tokenResponse.json();
  const { access_token, id_token } = tokenData;

  // 사용자 정보 요청
  const userInfoParams = new URLSearchParams({
    alt: "json",
    access_token: access_token,
  });

  const profileResponse = await fetch(`https://www.googleapis.com/oauth2/v1/userinfo?${userInfoParams.toString()}`, {
    headers: {
      Authorization: `Bearer ${id_token}`,
    },
  });

  if (!profileResponse.ok) {
    throw new Error(`HTTP error! status: ${profileResponse.status}`);
  }
  console.log(profileResponse);
  return profileResponse.json();
}

export default { getGoogleOauthURL, getGoogleUser };
