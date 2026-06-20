/**
 * editFile agent tool — string-replace edits (BUILD mode only).
 *
 * Replaces all occurrences of `oldString` globally. The model is instructed to
 * supply enough context in oldString so matches are unambiguous; zero matches
 * returns an error rather than silently no-oping.
 */
import { tool } from "ai";
import { z } from "zod";
import { relative } from "path";
import { readFile, writeFile } from "fs/promises";
import { resolvePathInCwd } from "./path-sandbox";

/** Replaces all literal occurrences of `oldString` in `content`. */
export function replaceAllLiteral(content: string, oldString: string, newString: string): string {
    return content.replaceAll(oldString, newString);
}

export function createEditFileTool(cwd:string){
    return tool({
        description: "Edit a file in the project directory. Use this for making small changes to the codebase. The file will be saved in the same directory as the project directory.",
        inputSchema: z.object({
            path: z.string().describe("The path to the file to edit relative to the project directory"),
            oldString: z.string().min(1).describe("The exact non-empty string to replace."),
            newString: z.string().describe("The new string to replace the old string with. This string will be replaced with the new string."),
        }),
        execute: async ({ path, oldString, newString }) => {
            const resolved = resolvePathInCwd(cwd, path);
            if (!resolved) {
                return { error: "Path is outside of the project directory" };
            }
            
            try{
                const content = await readFile(resolved,"utf-8");
                if(!content.includes(oldString)) {
                    return {error: `No occurrences of "${oldString}" found in ${path}`};
                }

               const updated = replaceAllLiteral(content, oldString, newString);
               await writeFile(resolved,updated,"utf-8");
               return {
                success: true as const,
                path: relative(cwd,resolved),
               };
            }catch(err){
                const message = err instanceof Error ? err.message : "An unknown error occurred";
                return {
                    error: `Failed to edit file: ${path} - ${message}`
                }
            }
        }
    });
}