import { useCallback} from "react";
import { useDialog } from "../../providers/dialog";
import { DialogSearchList } from "../dialog-search-list";
import type { SupportedChatModelId } from "@mocode/shared";

type ModelsDialogContentProps = {
    /** Full allow-list passed from COMMANDS (SUPPORTED_CHAT_MODELS ids). */
    models: SupportedChatModelId[];
    /** Writes into PromptConfigProvider via the slash-command action context. */
    onSelectModel: (model:SupportedChatModelId) => void;
}

/** Searchable picker opened by `/models`; commits model id on Enter and closes the dialog. */
export const ModelsDialogContent = ({
    models,
    onSelectModel,
}: ModelsDialogContentProps) => {
   const dialog = useDialog();

   const handleSelect = useCallback((modelId:SupportedChatModelId)=>{
    onSelectModel(modelId);
    dialog.close();
   },[onSelectModel,dialog]);

   return(
    <DialogSearchList
        items={models}
        onSelect={handleSelect}
        filterFn={(modelId,query)=>modelId.toLowerCase().includes(query.toLowerCase())}
        renderItem={(modelId,isSelected)=>(
            <text selectable={false} fg={isSelected? "black" : "white"}>
                {modelId}
            </text>
        )}
        getKey={(modelId)=>modelId.toString()}
        placeholder="Search models..."
        emptyText="No models found"
    />
   )

}