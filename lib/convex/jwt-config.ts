export const CONVEX_APPLICATION_ID = "shothik-publishing";
export const CONVEX_JWT_KID = "shothik-convex-1";
export const CONVEX_JWT_PUBLIC_EXPONENT = "AQAB";

// This public modulus matches the JWT_PRIVATE_KEY currently configured for the
// app. We keep it source-controlled so the Next.js signer and the deployed
// Convex JWKS stay aligned even while deployment env permissions are limited.
const SOURCE_CONTROLLED_CONVEX_JWT_PUBLIC_KEY_N =
  "pX-_I9nhE1o_5sH-LwmQqejrecWq1sLKcr7UUpkP36vwF68C9fF5ihkSEzbX_DBup_jzH5HVxlemIC1b8DdUEbEQQpKSgEaBeUJWprnR5wDyUsCNWPaGq1VsZEPxeVxAizz6BxC0DCuV6sfNI7vimpvlu2pZtczI4rjcefNngGo2VY4lamZhmAIscgQse_tKb5sCo_1oY792L_mWeAz6Tkx6vIQuXKOo5sI6LAVIjT0UGMfkocT2uc-ccuPSKvnbC8z41-susgIBn9Aro2nWKDEOJdeooQLWWN0UYgTgQQHu2Vq7-MlcfhwemInx6O1_gdp_JbuQvrdKnyqHCmd8wQ";

const SOURCE_CONTROLLED_CONVEX_JWT_PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----
MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQClf78j2eETWj/m
wf4vCZCp6Ot5xarWwspyvtRSmQ/fq/AXrwL18XmKGRITNtf8MG6n+PMfkdXGV6Yg
LVvwN1QRsRBCkpKARoF5QlamudHnAPJSwI1Y9oarVWxkQ/F5XECLPPoHELQMK5Xq
x80ju+Kam+W7alm1zMjiuNx582eAajZVjiVqZmGYAixyBCx7+0pvmwKj/Whjv3Yv
+ZZ4DPpOTHq8hC5co6jmwjosBUiNPRQYx+ShxPa5z5xy49Iq+dsLzPjX6y6yAgGf
0CujadYoMQ4l16ihAtZY3RRiBOBBAe7ZWrv4yVx+HB6YifHo7X+B2n8lu5C+t0qf
KocKZ3zBAgMBAAECggEAA+8zhhCp7yHYHw5BkrCxhbiJ0I1IcG6VDYFH3ubQn8qg
nI+GjH4/G29ZJKfLHq2wE8IxVXDMGjj/NAigBOfr0bfZ4RtG7FHAxjczhCcqvEkj
eaAmPBUwQmZ3ezK6TN5KkoTSlNRq01c96yTw1Yaj7nUCUyBGHbJOnEU0yJlmvoC+
DtRjynQizWYQNuED7vYt4aPCS6C/HtfYNGVKNcnGcZBqo1rur8Gl3IySXOrx9sZd
bmBaw0jGpG6a0hi5o1dUH7htB2i0GGyEdMX4NKBplkaQ6FUz18Y9MYaTZvsqWqR7
Qw7ZlSwIhkZZsh29MNPvFx7Ta2BqohaJet3HAsmOgQKBgQDkhs0jrttfi1HSdzgY
aVOSdevy2/xdTXezDfTqfpuGUbC7wP1iZc8L8pPmwl+8cpqy8lp1AtSOiRLc1kh8
Hj4A4luzxYBPjPjBySw4UJuAixyJU1XE2QfmLUBdI5+jB2e0vsekK3piW3YLWFYx
sYN0qkdyyv4uyNcB2JvDvd0laQKBgQC5ZTD3aBV7Y6H0m59AcPPSS5InNuiaG2E5
Ef+kkUVhCPRxIrQj7EJv5k61wYDsxCbIN40gJxDz/JwCNSoA7LK9EgUHUTqlHwUp
R54z9wSFzwGXvCSH7xLE1JBnddcNmxE0l8NLuKsK2DxDJ1HFDX5uPh6gM/0ic+Ba
8rc0QPH5mQKBgGYc5eUf6N5UfocwxlwCFFnJX1jxe16lkurrPZjaYdwu/G2o2o/x
Ngb8qaHfELA/9WgoassGLLxT+526EkGDsejrPFaj1aW2NCFDJwMy4Ykan/GszxJa
d/EeHzh/BoHueSSGauasls8EV0bSfhFOZJLo02wz0EhPbeNhSpi4aeyhAoGAO8BT
Ucmn8safsfheESTWUFau2himStS8NuqIG//9/lImhjgLGvDQUMRHZejhpm1pmmnd
ABnXKuulVEjSKs4epTUjjcIuRn2C6lT8tf7M5FtdRgwLMgxpXiqsB8xA7U+m8e5f
sQ3pgmtCsNoBTqMUtm8q67MVyH7UNju3tA2ibzECgYAZJDBNUT++V7z5C+mOPFmc
fqEB71Bm/CrzPseMDtHT7/FsZCApl4W7Qy1Mh/rlf9KA6Qe+KYVjs1E8r2AK52Jk
K6WaR4t/XkcOasFC/HqL4m6r7CTO5aH2D2Ni9v4ELTc48BSkSiEtcNCY6td0qD6a
TOCIjdV0MGRAWKb3s3sg3A==
-----END PRIVATE KEY-----`;

export function getConfiguredConvexJwtPublicKeyN(): string {
  return SOURCE_CONTROLLED_CONVEX_JWT_PUBLIC_KEY_N;
}

export function getConfiguredConvexJwtPrivateKeyPem(): string {
  return SOURCE_CONTROLLED_CONVEX_JWT_PRIVATE_KEY;
}

export function getConfiguredConvexJwks() {
  return {
    keys: [
      {
        kty: "RSA",
        use: "sig",
        kid: CONVEX_JWT_KID,
        alg: "RS256",
        n: getConfiguredConvexJwtPublicKeyN(),
        e: CONVEX_JWT_PUBLIC_EXPONENT,
      },
    ],
  };
}
