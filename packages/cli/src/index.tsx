import { createCliRenderer } from "@opentui/core";
import { createRoot } from "@opentui/react";
import { Header } from "./components/header";
import { InputBar } from "./components/input-bar";
import { runTerminalSetupFromArgv } from "./terminal-setup";
import {
  disableTerminalKeyboardProtocols,
  enableTerminalKeyboardProtocols,
  KITTY_KEYBOARD_OPTIONS,
} from "./terminal-keyboard";
import { ToastProvider } from "./providers/toast";
import { KeyboardLayerProvider } from "./providers/keyboard-layer";
import { DialogProvider } from "./providers/dialog";
import { ThemeProvider,useTheme } from "./providers/theme";

// Handle `--terminal-setup` before booting the TUI (macOS Apple Terminal only).
if (runTerminalSetupFromArgv(process.argv.slice(2))) {
  process.exit(0);
}

function ThemeRoot(){
  const {colors} = useTheme();
  return (
    <box 
      alignItems="center" 
      justifyContent="center" 
      backgroundColor={colors.background}
      width="100%"
      height="100%"
      gap={2}
    >
      <Header />
      <box width="100%" maxWidth={78} paddingX={2}>
        <InputBar onSubmit={()=>{}} />
      </box>
    
    </box>
  )
}

// Provider order: theme tokens → keyboard stack → modal overlays → toasts.
function App() {
  return (
   
    <ThemeProvider>
      <KeyboardLayerProvider>
        <DialogProvider>
          <ToastProvider>
            <ThemeRoot />
          </ToastProvider>
        </DialogProvider>
      </KeyboardLayerProvider>
    </ThemeProvider>

  );
}

// OpenTUI renderer: Kitty + modifyOtherKeys let Shift+Enter differ from Enter.
const renderer = await createCliRenderer({
  targetFps: 60,
  exitOnCtrlC: false, // /exit command owns shutdown; avoid double-handling Ctrl+C.
  useKittyKeyboard: KITTY_KEYBOARD_OPTIONS,
  onDestroy: disableTerminalKeyboardProtocols,
});
enableTerminalKeyboardProtocols(renderer);
createRoot(renderer).render(<App />);
