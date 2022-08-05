// REACT_APP_* entries are defined in the file .env.local which is in project top level folder
// You only need to populate the .env.local if you are in the development stage.
// Do NOT commit .env.local file to any source control

const isLocalDev = process.env.REACT_APP_LOCAL_DEV === "true";
const websiteUrlOrigin = window.location.origin;
const assetWebsiteUrl = process.env.REACT_APP_ASSET_WEBSITE_URL ?? websiteUrlOrigin;
const accessKey = process.env.REACT_APP_ACCESS_KEY ?? "";
const secretKey = process.env.REACT_APP_SECRET_KEY ?? "";

export { isLocalDev, websiteUrlOrigin, assetWebsiteUrl, accessKey, secretKey };
