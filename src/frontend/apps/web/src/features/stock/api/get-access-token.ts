'use server';

export const getAccessToken = async () => {
  const API_KEY = process.env.API_KEY;
  const API_SECRET_KEY = process.env.API_SECRET_KEY;
  const response = await fetch(
    'https://openapivts.koreainvestment.com:29443/oauth2/Approval',
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'client_credentials',
        appkey: API_KEY,
        secretkey: API_SECRET_KEY,
      }),
    },
  );
  const data = await response.json();
  console.log(data);
  return data.approval_key;
};
