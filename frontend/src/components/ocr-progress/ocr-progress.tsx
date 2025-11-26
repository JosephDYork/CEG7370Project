import { useMagicBoxStore } from "../../stores/magic-box-store";
import "./ocr-progress.css";

export const OCRProgress = () => {
  const { isProcessing, progress } = useMagicBoxStore();

  if (!isProcessing) return null;

  return (
    <div className="ocr-progress-overlay">
      <div className="ocr-progress-modal">
        <div className="ocr-progress-icon">✨</div>
        <h3 className="ocr-progress-title">Processing with Magic Box...</h3>
        <p className="ocr-progress-status">{progress.status}</p>
        <div className="ocr-progress-bar">
          <div
            className="ocr-progress-fill"
            style={{ width: `${progress.progress * 100}%` }}
          />
        </div>
        <p className="ocr-progress-percentage">
          {Math.round(progress.progress * 100)}%
        </p>
      </div>
    </div>
  );
};
