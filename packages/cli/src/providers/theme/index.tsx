/** Theme state with ~/.mocode/preferences.json persistence. */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import { DEFAULT_THEME, THEMES } from "../../theme";
import { createContext, useContext, useState, useCallback } from "react";
import type { ReactNode } from "react";
import type { ThemeColors, Theme } from "../../theme";

const CONFIG_DIR = join(homedir(), ".mocode");
const THEME_PREFERENCES_PATH = join(CONFIG_DIR, "preferences.json");

type ThemePreferences = {
    themeName: string;
}

function getInitialTheme(): Theme {
    try{
        const preferences = JSON.parse(readFileSync(THEME_PREFERENCES_PATH, "utf8")) as Partial<ThemePreferences>;
        const savedTheme = THEMES.find((t) => t.name === preferences.themeName);
        return savedTheme ?? DEFAULT_THEME;

    }catch{
        return DEFAULT_THEME;
    }
}

function persistTheme(theme: Theme) {
    try{
        mkdirSync(CONFIG_DIR, { recursive: true });
        writeFileSync(THEME_PREFERENCES_PATH, JSON.stringify({ themeName: theme.name } satisfies ThemePreferences, null, 2),"utf8");
    }catch(error){
        console.error("Failed to persist theme preferences:", error);
    }
}


type SetThemeOptions = {
    persist?: boolean;
}

type ThemeContextValue = {
    colors: ThemeColors;
    currentTheme: Theme;
    setTheme: (theme: Theme, options?: SetThemeOptions) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme(): ThemeContextValue {
    const context = useContext(ThemeContext);
    if(!context){
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}

type ThemeProviderProps = {
    children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
    const [currentTheme, setCurrentTheme] = useState<Theme>(getInitialTheme);

    const setTheme = useCallback((theme: Theme, options?: SetThemeOptions) => {
        setCurrentTheme(theme);
        if (options?.persist !== false) {
            persistTheme(theme);
        }
    }, []);

    return (
        <ThemeContext.Provider value={{ colors: currentTheme.colors, currentTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}