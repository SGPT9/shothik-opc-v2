// Stub for "motion/react-client" (Next.js server-safe entry of the `motion` package).
// The codebase uses `import * as motion from "motion/react-client"` and then renders
// `motion.div`, `motion.h1`, etc. framer-motion provides the same components on its
// `motion` proxy object, so re-export the used tags as named exports.
import { motion } from 'framer-motion';

export const div = motion.div;
export const span = motion.span;
export const p = motion.p;
export const h1 = motion.h1;
export const h2 = motion.h2;
export const h3 = motion.h3;
export const h4 = motion.h4;
export const h5 = motion.h5;
export const h6 = motion.h6;
export const button = motion.button;
export const section = motion.section;
export const ul = motion.ul;
export const li = motion.li;
export const a = motion.a;
export const img = motion.img;
export const header = motion.header;
export const footer = motion.footer;
export const nav = motion.nav;
export const article = motion.article;
export const aside = motion.aside;
export const main = motion.main;
export const form = motion.form;
export const label = motion.label;
export const svg = motion.svg;
export const path = motion.path;

export default motion;
