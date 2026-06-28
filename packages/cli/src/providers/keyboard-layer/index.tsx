/**
 * Stack-based keyboard focus manager for overlapping TUI overlays.
 *
 * Layers (base → command → dialog) register optional Ctrl+C responders.
 * The topmost layer that returns true from its responder consumes the key;
 * otherwise the app exits via renderer.destroy().
 */
import {
    createContext,
    useContext,
    useState,
    useCallback,
    useRef,
} from "react";

import { useKeyboard, useRenderer } from "@opentui/react";

/** Return true when the key was handled and should not propagate. */
type Responder = () => boolean;

type KeyboardLayerContextValue = {
    push:(id:string,responder?:Responder)=>void;
    pop:(id:string)=>void;
    isTopLayer:(id:string)=>boolean;
    setResponder:(id:string,responder:Responder | null)=>void;
}

const KeyboardLayerContext = createContext<KeyboardLayerContextValue | null>(null);

export function KeyboardLayerProvider({ children }: { children: React.ReactNode }) {
    const [stack,setStack] = useState<string[]>(["base"]);
    const stackRef = useRef(stack);
    stackRef.current = stack;

    const responders = useRef<Map<string,Responder>>(new Map());
    const renderer = useRenderer();

    // Push is idempotent: re-opening the same layer does not duplicate stack entries.
    const push = useCallback((id:string,responder?:Responder)=>{
        if(responder){
            responders.current.set(id,responder);
        }
        setStack((prev)=>{
            if(prev.includes(id)){
                return prev;
            }
            return [...prev,id];
        });

    },[]);

    const pop = useCallback((id:string)=>{
        responders.current.delete(id);
        setStack((prev)=> prev.filter((layer)=>layer !== id))
    },[]);

    const isTopLayer = useCallback((id:string)=>{
        return stack.length === 0 || stack[stack.length - 1] === id;
    },[stack]);

    const setResponder = useCallback((id:string,responder:Responder | null)=>{
        if(responder){
            responders.current.set(id,responder);
        }else{
            responders.current.delete(id);
        }
    },[]);

    // Walk the stack top-down so overlays can intercept Ctrl+C before app exit.
    useKeyboard((key)=>{
        if(!key.ctrl || key.name !== "c") return;
        const currentStack = stackRef.current;
        for(let i= currentStack.length - 1; i >= 0; i--){
           const layerId = currentStack[i]!;
           const responder = responders.current.get(layerId);
           if(responder?.()){
            return;
           }
        }
        renderer.destroy();
    })

    return(
        <KeyboardLayerContext.Provider value={{
            push,
            pop,
            isTopLayer,
            setResponder,
        }}>
            {children}
        </KeyboardLayerContext.Provider>
    )

}

export function useKeyboardLayer(){
    const context = useContext(KeyboardLayerContext);
    if(!context){
        throw new Error("useKeyboardLayer must be used within a KeyboardLayerProvider");
    }
    return context;
}