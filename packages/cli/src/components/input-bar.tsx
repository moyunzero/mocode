import { useRef,useCallback,useEffect } from "react";
import type { TextareaRenderable } from "@opentui/core";
import type { KeyBinding } from "@opentui/core";
import { useRenderer, useKeyboard } from "@opentui/react";
import { StatusBar } from "./status-bar";
import { EmptyBorder } from "./border";
import { CommandMenu } from "./command-menu";
import type {Command} from "./command-menu/types";
import { useCommandMenu } from "./command-menu/use-command-menu";
import { useToast } from "../providers/toast";
import { useKeyboardLayer } from "../providers/keyboard-layer";
import { useDialog } from "../providers/dialog";
import { useTheme } from "../providers/theme";
import { useNavigate } from "react-router";
import { usePromptConfig } from "../providers/prompt-config";
import { Mode } from "@mocode/database/enums";


type Props = {
  onSubmit: (text: string) => void;
  disabled?: boolean;
};

/**
 * Enter submits; Shift+Enter inserts a newline when the terminal reports modifier keys.
 * Apple Terminal cannot distinguish Shift+Enter — fall back to Ctrl+J or Option+Enter
 * (Option+Enter requires `bun run dev:cli -- --terminal-setup` on macOS).
 */
export const TEXTAREA_KEY_BINDINGS: KeyBinding[] = [
  { name: "return", action: "submit" },
  { name: "enter", action: "submit" },
  { name: "kpenter", action: "submit" },
  { name: "return", shift: true, action: "newline" },
  { name: "enter", shift: true, action: "newline" },
  { name: "kpenter", shift: true, action: "newline" },
  { name: "linefeed", action: "newline" },
  { name: "j", ctrl: true, action: "newline" },
  { name: "return", meta: true, action: "newline" },
  { name: "enter", meta: true, action: "newline" },
  { name: "kpenter", meta: true, action: "newline" },
];

export function InputBar({ onSubmit, disabled = false }: Props) {
  const { mode, toggleMode, setMode, setModel } = usePromptConfig();
  const textareaRef = useRef<TextareaRenderable>(null);
  const onSubmitRef = useRef<()=> void>(()=>{});
  const renderer = useRenderer();
  const toast = useToast();
  const { colors } = useTheme();
  const navigate = useNavigate();

  const { push, pop, isTopLayer, setResponder } = useKeyboardLayer();
  const dialog = useDialog();
  const {
    showCommandMenu,
    commandQuery,
    selectedIndex,
    scrollRef,
    resolveCommand,
    handleContentChange,
    setSelectedIndex,
  } = useCommandMenu();

  const handleCommand = useCallback((
    command:Command | undefined
  )=>{
    const textarea = textareaRef.current;
    if(!textarea || !command) return;
    textarea.setText("");
    if(command.action){
        // Wire prompt config mutators into slash commands (/agents, /models, etc.).
        void Promise.resolve(
          command.action({
            exit:()=>{
                renderer.destroy()
            },
            toast,
            dialog,
            navigate:navigate,
            mode,
            setMode,
            setModel,
          }),
        ).catch((error)=>{
          console.error("Command execution failed:", error);
        });
    }else{
        // Commands without an action become editable text (e.g. "/models ").
        textarea.insertText(command.value + " ");
    }
  },[renderer, toast, dialog, navigate, mode, setMode, setModel])

  const handleCommandExecute = useCallback((index:number)=>{
    const command = resolveCommand(index);
    handleCommand(command);
  },[resolveCommand, handleCommand])

  const handleTextareaContentChange = useCallback(()=>{
    const textarea = textareaRef.current;
    if(!textarea) return;
    handleContentChange(textarea.plainText);
  },[handleContentChange])


  const handleSubmit = useCallback(()=>{
    if(disabled) return;

    const textarea = textareaRef.current;
    if(!textarea) return;
    
    const text = textarea.plainText.trim();
    if(text.length === 0) return;
    onSubmit(text);
    textarea.setText("");
  },[disabled,onSubmit])

  useEffect(()=>{
    const textarea = textareaRef.current;
    if(!textarea) return;
    textarea.onSubmit = ()=>{
        onSubmitRef.current();
    }
  },[]);

  // Stable ref so textarea.onSubmit always sees the latest menu/submit logic.
  onSubmitRef.current = ()=>{
    if(disabled) return;
    if(showCommandMenu){
        const command = resolveCommand(selectedIndex);
        handleCommand(command);
        return;
    }
    handleSubmit();
  };

  useKeyboard((key)=>{
    if(disabled) return;
    if(!isTopLayer("base")) return;
    // Tab toggles Build ↔ Plan without leaving the textarea.
    if(key.name === "tab"){
      key.preventDefault();
      toggleMode();
    }
  })

  // Base layer: Ctrl+C clears non-empty input before falling through to app exit.
  useEffect(()=>{
    setResponder("base",()=>{
      if(disabled) return false;
      const textarea = textareaRef.current;
      if(textarea && textarea.plainText.length > 0) {
        textarea.setText("");
        return true;
      }
      return false;
    });
    return ()=>{
      setResponder("base",null);
    }
  },[disabled,setResponder])


  return (
    <box width="100%" alignItems="center">
      <box
        border={["left"]}
        // Left accent reflects agent mode (shared with StatusBar and Spinner).
        borderColor={mode === Mode.PLAN ? colors.planMode : colors.primary}
        customBorderChars={{
          ...EmptyBorder,
          vertical: "┃",
          bottomLeft: "╹",
        }}
        width="100%"
      >
        <box
          position="relative"
          justifyContent="center"
          paddingX={2}
          paddingY={1}
          backgroundColor={colors.surface}
          width="100%"
          gap={1}
        >
            {showCommandMenu &&(
                <box
                    position="absolute"
                    bottom="100%"
                    left={0}
                    width="100%"
                    backgroundColor={colors.surface}
                    zIndex={10}
                >
                    <CommandMenu 
                        query={commandQuery}
                        selectedIndex={selectedIndex}
                        scrollRef={scrollRef}
                        onSelect={setSelectedIndex}
                        onExecute={handleCommandExecute}
                    />
                </box>
            )}
          {/* Keep focus while the command menu is open; yield when a dialog is on top. */}
          <textarea
            ref={textareaRef}
            focused={!disabled && (isTopLayer("base") || isTopLayer("command"))}
            keyBindings={TEXTAREA_KEY_BINDINGS}
            onContentChange={handleTextareaContentChange}
            placeholder="Ask anything..."
          />
          <StatusBar />
        </box>
      </box>
    </box>
  );
}
