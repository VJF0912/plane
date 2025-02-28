import React from "react";
import { useRouter } from "next/router";
import { useForm, Controller } from "react-hook-form";
import { Globe2, Lock } from "lucide-react";
// hooks
import { useMention, useWorkspace } from "hooks/store";
// services
import { FileService } from "services/file.service";
// components
import { LiteTextEditorWithRef } from "@plane/lite-text-editor";
// ui
import { Button } from "@plane/ui";
// types
import type { IIssueActivity } from "@plane/types";

const defaultValues: Partial<IIssueActivity> = {
  access: "INTERNAL",
  comment_html: "",
};

type IIssueCommentEditor = {
  disabled?: boolean;
  onSubmit: (data: IIssueActivity) => Promise<void>;
  showAccessSpecifier?: boolean;
};

type commentAccessType = {
  icon: any;
  key: string;
  label: "Private" | "Public";
};
const commentAccess: commentAccessType[] = [
  {
    icon: Lock,
    key: "INTERNAL",
    label: "Private",
  },
  {
    icon: Globe2,
    key: "EXTERNAL",
    label: "Public",
  },
];

// services
const fileService = new FileService();

export const IssueCommentEditor: React.FC<IIssueCommentEditor> = (props) => {
  const { disabled = false, onSubmit, showAccessSpecifier = false } = props;
  // refs
  const editorRef = React.useRef<any>(null);
  // router
  const router = useRouter();
  const { workspaceSlug } = router.query;
  const workspaceStore = useWorkspace();
  const workspaceId = workspaceStore.getWorkspaceBySlug(workspaceSlug as string)?.id as string;

  // store hooks
  const { mentionHighlights, mentionSuggestions } = useMention();
  // form info
  const {
    control,
    formState: { isSubmitting },
    handleSubmit,
    reset,
  } = useForm<IIssueActivity>({ defaultValues });

  const handleAddComment = async (formData: IIssueActivity) => {
    if (!formData.comment_html || isSubmitting) return;

    await onSubmit(formData).then(() => {
      reset(defaultValues);
      editorRef.current?.clearEditor();
    });
  };

  return (
    <form onSubmit={handleSubmit(handleAddComment)}>
      <div className="space-y-2 py-2">
        <div className="h-full">
          <Controller
            name="access"
            control={control}
            render={({ field: { onChange: onAccessChange, value: accessValue } }) => (
              <Controller
                name="comment_html"
                control={control}
                render={({ field: { onChange: onCommentChange, value: commentValue } }) => (
                  <LiteTextEditorWithRef
                    onEnterKeyPress={handleSubmit(handleAddComment)}
                    cancelUploadImage={fileService.cancelUpload}
                    uploadFile={fileService.getUploadFileFunction(workspaceSlug as string)}
                    deleteFile={fileService.getDeleteImageFunction(workspaceId)}
                    restoreFile={fileService.getRestoreImageFunction(workspaceId)}
                    ref={editorRef}
                    value={!commentValue || commentValue === "" ? "<p></p>" : commentValue}
                    customClassName="p-2 h-full"
                    editorContentCustomClassNames="min-h-[35px]"
                    debouncedUpdatesEnabled={false}
                    mentionSuggestions={mentionSuggestions}
                    mentionHighlights={mentionHighlights}
                    onChange={(comment_json: Object, comment_html: string) => onCommentChange(comment_html)}
                    commentAccessSpecifier={
                      showAccessSpecifier
                        ? { accessValue: accessValue ?? "INTERNAL", onAccessChange, showAccessSpecifier, commentAccess }
                        : undefined
                    }
                    submitButton={
                      <Button
                        variant="primary"
                        type="submit"
                        className="!px-2.5 !py-1.5 !text-xs"
                        disabled={isSubmitting || disabled}
                      >
                        {isSubmitting ? "Adding..." : "Comment"}
                      </Button>
                    }
                  />
                )}
              />
            )}
          />
        </div>
      </div>
    </form>
  );
};
