import { execSync } from 'child_process';

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

const envsToSet = {
  NEXT_PUBLIC_CONVEX_URL: "https://dashing-mandrill-233.convex.cloud",
  CONVEX_URL: "https://dashing-mandrill-233.convex.cloud",
  CONVEX_DEPLOYMENT: "dev:dashing-mandrill-233",
  CONVEX_SITE_URL: "https://dashing-mandrill-233.convex.site",
  NEXT_PUBLIC_CONVEX_SITE_URL: "https://dashing-mandrill-233.convex.site",
  JWT_PRIVATE_KEY: SOURCE_CONTROLLED_CONVEX_JWT_PRIVATE_KEY,
};

const targets = ["production", "preview", "development"];

for (const [key, val] of Object.entries(envsToSet)) {
  for (const target of targets) {
    try {
      console.log(`Removing old ${key} for ${target}...`);
      execSync(`npx vercel env rm ${key} ${target} --yes`, { stdio: "ignore" });
    } catch {}

    try {
      console.log(`Setting clean ${key} for ${target}...`);
      execSync(`npx vercel env add ${key} ${target}`, {
        input: val,
        stdio: ["pipe", "ignore", "ignore"],
      });
      console.log(`✅ Set clean ${key} for ${target}`);
    } catch (e) {
      console.error(`Failed to set ${key} for ${target}:`, e);
    }
  }
}

console.log("Done updating clean env vars on Vercel!");
