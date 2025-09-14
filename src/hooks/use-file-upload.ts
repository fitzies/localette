import { useCallback, useRef, useState } from "react";

interface FileWithPreview extends File {
  preview?: string;
  id?: string;
}

interface FileUploadState {
  files: FileWithPreview[];
  isDragging: boolean;
  errors: string[];
}

interface FileUploadOptions {
  accept?: string;
  maxSize?: number;
  multiple?: boolean;
}

export function useFileUpload(options: FileUploadOptions = {}) {
  const { accept = "*", maxSize = 5 * 1024 * 1024, multiple = false } = options;
  const [state, setState] = useState<FileUploadState>({
    files: [],
    isDragging: false,
    errors: [],
  });

  const inputRef = useRef<HTMLInputElement>(null);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const createFileWithPreview = (file: File): FileWithPreview => {
    const fileWithPreview = file as FileWithPreview;
    fileWithPreview.id = generateId();

    if (file.type.startsWith("image/")) {
      fileWithPreview.preview = URL.createObjectURL(file);
    }

    return fileWithPreview;
  };

  const validateFile = (file: File): string | null => {
    if (file.size > maxSize) {
      return `File size must be less than ${Math.round(
        maxSize / (1024 * 1024)
      )}MB`;
    }
    return null;
  };

  const addFiles = useCallback(
    (newFiles: FileList | File[]) => {
      const filesArray = Array.from(newFiles);
      const validFiles: FileWithPreview[] = [];
      const errors: string[] = [];

      filesArray.forEach((file) => {
        const error = validateFile(file);
        if (error) {
          errors.push(error);
        } else {
          validFiles.push(createFileWithPreview(file));
        }
      });

      setState((prev) => ({
        ...prev,
        files: multiple ? [...prev.files, ...validFiles] : validFiles,
        errors,
      }));
    },
    [maxSize, multiple]
  );

  const removeFile = useCallback((fileId?: string) => {
    setState((prev) => {
      const fileToRemove = prev.files.find((f) => f.id === fileId);
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }

      return {
        ...prev,
        files: fileId
          ? prev.files.filter((f) => f.id !== fileId)
          : prev.files.slice(0, -1),
      };
    });
  }, []);

  const openFileDialog = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setState((prev) => ({ ...prev, isDragging: true }));
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setState((prev) => ({ ...prev, isDragging: false }));
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setState((prev) => ({ ...prev, isDragging: false }));

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        addFiles(files);
      }
    },
    [addFiles]
  );

  const getInputProps = useCallback(
    () => ({
      ref: inputRef,
      type: "file",
      accept,
      multiple,
      style: { display: "none" },
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
          addFiles(files);
        }
      },
    }),
    [accept, multiple, addFiles]
  );

  return [
    state,
    {
      addFiles,
      removeFile,
      openFileDialog,
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      getInputProps,
    },
  ] as const;
}
