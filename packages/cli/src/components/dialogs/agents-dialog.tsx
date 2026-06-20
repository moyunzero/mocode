import { useCallback} from "react";
import { useDialog } from "../../providers/dialog";
import { DialogSearchList } from "../dialog-search-list";
import { Mode } from "@mocode/database/enums";

/** Modes exposed in the /agents picker (subset of the Mode enum). */
const AVAILABLE_MODES: Mode[] = [Mode.BUILD, Mode.PLAN];

type AgentsDialogContentProps = {
    /** Highlighted with a bullet in the list; not disabled — user may re-select the same mode. */
    currentMode: Mode;
    /** Writes into PromptConfigProvider via the slash-command action context. */
    onSelectMode: (mode:Mode) => void;
}

function getModeLabel(mode:Mode){
    return mode === Mode.PLAN? "Plan" : "Build";
}

/** Searchable picker opened by `/agents`; commits mode on Enter and closes the dialog. */
export const AgentsDialogContent = ({
    currentMode,
    onSelectMode,
}: AgentsDialogContentProps) => {
   const dialog = useDialog();

   const handleSelect = useCallback((nextMode:Mode)=>{
    onSelectMode(nextMode);
    dialog.close();
   },[onSelectMode,dialog]);

   return(
    <DialogSearchList
        items={AVAILABLE_MODES}
        onSelect={handleSelect}
        filterFn={(item,query)=>getModeLabel(item).toLowerCase().includes(query.toLowerCase())}
        renderItem={(item,isSelected)=>(
            <text selectable={false} fg={isSelected? "black" : "white"}>
                {/* Bullet marks the active agent; padding keeps labels aligned. */}
                {item === currentMode ? "\u0020\u2022\u0020" : "\u0020\u0020\u0020"}
                {getModeLabel(item)}
            </text>
        )}
        getKey={(item)=>item.toString()}
        placeholder="Search agents..."
        emptyText="No agents found"
    />
   )

}