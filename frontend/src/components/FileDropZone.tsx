import { useCallback, useState, useRef } from 'react';
import { Upload, FileText, X, CheckCircle2 } from 'lucide-react';

interface FileDropZoneProps {
  label: string;
  accept?: string;
  onFileSelect: (file: File) => void;
  file: File | null;
  onClear: () => void;
  disabled?: boolean;
}

export default function FileDropZone({
  label,
  accept = '.pdf,.doc,.docx,.txt',
  onFileSelect,
  file,
  onClear,
  disabled = false,
}: FileDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled) return;
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) onFileSelect(droppedFile);
    },
    [onFileSelect, disabled]
  );

  const handleClick = () => {
    if (!disabled && !file) inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) onFileSelect(selectedFile);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="w-full">
      {label && <p className="form-label">{label}</p>}

      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`drop-zone ${isDragging ? 'is-dragging' : ''} ${file ? 'has-file' : ''} ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
        role="button"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(event) => {
          if (!disabled && (event.key === 'Enter' || event.key === ' ')) {
            event.preventDefault();
            handleClick();
          }
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
          disabled={disabled}
        />

        {file ? (
          <div className="flex items-center gap-4">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-text-primary" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-text-primary truncate">
                {file.name}
              </p>
              <p className="text-xs text-text-muted mt-1">
                {formatSize(file.size)}
              </p>
            </div>
            {!disabled && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onClear();
                }}
                className="rounded-lg p-2 text-text-muted hover:text-text-primary"
                aria-label="Remove selected file"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          <div className="flex min-h-[126px] flex-col items-center justify-center gap-3 text-center">
            {isDragging ? <FileText className="h-6 w-6" /> : <Upload className="h-6 w-6 text-text-secondary" />}
            <div>
              <p className="text-sm font-medium text-text-primary">
                {isDragging ? 'Drop to add your file' : 'Drop a file here or browse'}
              </p>
              <p className="mt-1 text-xs text-text-muted">
                PDF, DOC, DOCX or TXT
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
