/* lets node run the app's TypeScript files directly: "./format" -> "./format.ts" (test helper, no dependency) */
export async function resolve(specifier, context, next) {
  if (specifier.startsWith(".") && !/\.[a-z]+$/.test(specifier)) {
    try { return await next(specifier + ".ts", context); } catch {}
  }
  return next(specifier, context);
}
