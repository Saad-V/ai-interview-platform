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
      {label && (
        <label className="block text-sm font-medium text-text-secondary mb-3">
          {label}
        </label>
      )}

      <motion.div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        whileHover={!file && !disabled ? { scale: 1.01, borderColor: 'rgba(124, 58, 237, 0.3)' } : undefined}
        whileTap={!file && !disabled ? { scale: 0.99 } : undefined}
        className={`
          relative rounded-lg border-2 border-dashed transition-all duration-300
          ${isDragging
            ? 'border-primary bg-primary/10 scale-[1.02] shadow-lg shadow-primary/20'
            : file
              ? 'border-success/40 bg-success/8 shadow-sm shadow-success/10'
              : disabled
                ? 'border-border-subtle/50 bg-surface/30 cursor-not-allowed opacity-40'
                : 'border-border/60 bg-surface/30 hover:bg-surface/50 cursor-pointer hover:shadow-sm hover:shadow-primary/10'
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
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-4 p-6"
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              className="w-12 h-12 rounded-lg bg-success/15 border border-success/30 flex items-center justify-center shrink-0"
            >
              <CheckCircle2 className="w-5 h-5 text-success" />
            </motion.div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-text-primary truncate">
                {file.name}
              </p>
              <p className="text-xs text-text-muted mt-1">
                {formatSize(file.size)}
              </p>
            </div>
            {!disabled && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onClear();
                }}
                className="p-2 rounded-lg hover:bg-danger/15 text-text-muted hover:text-danger transition-all"
              >
                <X className="w-4 h-4" />
              </motion.button>
            )}
          </motion.div>
        ) : (
          <div className="flex flex-col items-center gap-4 py-12 px-4">
            <motion.div
              animate={isDragging ? { y: -5, scale: 1.15 } : { y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="relative"
            >
              <motion.div
                animate={isDragging ? { opacity: 1, scale: 1.2 } : { opacity: 0, scale: 1 }}
                className="absolute inset-0 w-14 h-14 rounded-lg bg-primary/20 blur-lg"
              />
              <div className="w-14 h-14 rounded-lg bg-primary/12 border border-primary/25 flex items-center justify-center relative">
                {isDragging ? (
                  <FileText className="w-7 h-7 text-primary" />
                ) : (
                  <Upload className="w-7 h-7 text-primary/70" />
                )}
              </div>
            </motion.div>
            <motion.div
              animate={isDragging ? { scale: 1.05 } : { scale: 1 }}
              className="text-center"
            >
              <p className="text-sm font-semibold text-text-primary">
                {isDragging ? 'Drop here to upload' : 'Drag and drop your file'}
              </p>
              <p className="text-xs text-text-muted mt-2">
                or click to browse • PDF, DOC, DOCX, or TXT
              </p>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
