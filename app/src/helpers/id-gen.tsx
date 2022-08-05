import { customAlphabet } from "nanoid";

// https://zelark.github.io/nano-id-cc/
// const alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

// We need to keep the alphabet to lower case because the generated id is used in bucket names and
// bucket names need to conform to DNS naming requirements
const alphabet = "0123456789abcdefghijklmnopqrstuvwxyz";
const nanoid = customAlphabet(alphabet, 12);

export { nanoid as genId };
