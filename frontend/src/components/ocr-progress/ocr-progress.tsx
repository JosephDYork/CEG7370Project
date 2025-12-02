import { useMagicBoxStore } from "../../stores/magic-box-store";
import "./ocr-progress.css";

export const OCRProgress = () => {
  const { isProcessing, progress, errorMessage } = useMagicBoxStore();

  if (!isProcessing) return null;

  const isError = errorMessage !== null || (progress && progress.status.toLowerCase().includes('failed'));
  const isWarning = progress && (
    progress.status.toLowerCase().includes('no text') ||
    progress.status.toLowerCase().includes('confidence too low')
  );

  return (
    <div className="ocr-progress-overlay">
      <div className="ocr-progress-modal">
        <div className="ocr-progress-icon">
          {isError ? '❌' : isWarning ? '⚠️' : '✨'}
        </div>
        <h3 className="ocr-progress-title">
          {isError ? 'OCR Failed' : isWarning ? 'OCR Warning' : 'Processing with Magic Box...'}
        </h3>
        <p className="ocr-progress-status" style={{
          color: isError ? '#d32f2f' : isWarning ? '#f57c00' : '#666'
        }}>
          {errorMessage || progress?.status}
        </p>
        {!isError && !isWarning && progress && (
          <>
            <div className="ocr-progress-bar">
              <div
                className="ocr-progress-fill"
                style={{ width: `${progress.progress * 100}%` }}
              />
            </div>
            <p className="ocr-progress-percentage">
              {Math.round(progress.progress * 100)}%
            </p>
          </>
        )}
      </div>
    </div>
  );
};
