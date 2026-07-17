import { useCallback, useState, useRef } from 'react';
import { motion } from 'framer-motion';
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
      <label className="block text-sm font-medium text-text-secondary mb-2.5">
        {label}
      </label>

      <motion.div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        whileHover={!file && !disabled ? { scale: 1.01 } : undefined}
        whileTap={!file && !disabled ? { scale: 0.99 } : undefined}
        className={`
          relative rounded-xl border-2 border-dashed transition-all duration-300
          ${isDragging
            ? 'border-primary bg-primary/8 scale-[1.02]'
            : file
              ? 'border-success/30 bg-success/5'
              : disabled
                ? 'border-border-subtle bg-surface/40 cursor-not-allowed opacity-50'
                : 'border-border hover:border-primary/40 bg-surface/20 hover:bg-surface/40 cursor-pointer'
          }
        `}
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
          <div className="flex items-center gap-4 p-5">
            <div className="w-11 h-11 rounded-lg bg-success/10 border border-success/20 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-success" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">
                {file.name}
              </p>
              <p className="text-xs text-text-muted mt-0.5">
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
                className="p-2 rounded-lg hover:bg-danger/10 text-text-muted hover:text-danger transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-10 px-4">
            <motion.div
              animate={isDragging ? { y: -4, scale: 1.1 } : { y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center"
            >
              {isDragging ? (
                <FileText className="w-6 h-6 text-primary" />
              ) : (
                <Upload className="w-6 h-6 text-primary" />
              )}
            </motion.div>
            <div className="text-center">
              <p className="text-sm text-text-secondary font-medium">
                {isDragging ? 'Drop your file here' : 'Drag and drop or click to upload'}
              </p>
              <p className="text-xs text-text-muted mt-1.5">
                PDF, DOC, DOCX, or TXT
              </p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
