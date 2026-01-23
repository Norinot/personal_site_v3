import { useState } from "react";
import { Upload, X, FileAudio, Loader2 } from "lucide-react";
import ChamferInput from "../CamferInput/ChamferInput.component";
import styles from "./UploadModal.module.scss";
import ChamferBox from "../CamferBox/ChamferBox.component";
import { useAuth } from "@clerk/clerk-react";
import { URL_BASEAPTH } from "@/App";

const UploadModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const { getToken } = useAuth();

  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      if (!title) {
        setTitle(e.target.files[0].name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      console.error("Unselected file");
      return;
    }

    setIsUploading(true);

    try {
      const token = await getToken();

      const formData = new FormData();
      formData.append("music_file", file);
      formData.append("title", title);
      formData.append("artist", artist);
      formData.append("description", description);
      // ------------------------------------------

      const response = await fetch(URL_BASEAPTH + "upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      console.info("Upload succesfull");

      onClose();
      setFile(null);
      setTitle("");
      setArtist("");
      setDescription("");
    } catch (error) {
      console.error(error);
      console.error("Error uploading file. Check console.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.backdrop} onClick={onClose} />

      <div className={styles.modalContainer}>
        <ChamferBox cutSize={30} borderColor="var(--accent)" bg="#13151a">
          <div className={styles.header}>
            <h3 className={styles.title}>
              <Upload size={20} className={styles.icon} />
              Upload Track
            </h3>
            <button onClick={onClose} className={styles.closeBtn}>
              <X size={24} />
            </button>
          </div>

          <div className={styles.formStack}>
            <div>
              <label className={styles.inputLabel}>Audio File</label>
              <ChamferBox
                cutSize={15}
                borderColor={file ? "var(--accent)" : "#374151"}
                bg="#0f1115"
                noPadding
              >
                <label
                  className={styles.uploadArea}
                  style={{ cursor: "pointer" }}
                >
                  <div className={styles.iconCircle}>
                    <FileAudio
                      size={32}
                      className={styles.uploadIcon}
                      style={{ color: file ? "var(--accent)" : "inherit" }}
                    />
                  </div>
                  <p className={styles.mainText}>
                    {file ? file.name : "Click to select MP3"}
                  </p>
                  <p className={styles.subText}>
                    {file
                      ? `${(file.size / 1024 / 1024).toFixed(2)} MB`
                      : "or drag and drop here"}
                  </p>

                  <input
                    type="file"
                    accept=".mp3"
                    className={styles.hiddenInput}
                    onChange={handleFileChange}
                  />
                </label>
              </ChamferBox>
            </div>

            <div className={styles.inputGrid}>
              <ChamferInput
                label="Track Title"
                placeholder="e.g. Neon Horizon"
                value={title}
                onChange={(e: any) => setTitle(e.target.value)}
              />
              <ChamferInput
                label="Artist"
                placeholder="e.g. Synthwave Boy"
                value={artist}
                onChange={(e: any) => setArtist(e.target.value)}
              />
            </div>

            <ChamferInput
              label="Description"
              as="textarea"
              rows={3}
              placeholder="Short track description..."
              value={description}
              onChange={(e: any) => setDescription(e.target.value)}
            />

            <div className={styles.actions}>
              <button onClick={onClose} className={styles.cancelBtn}>
                Cancel
              </button>

              <ChamferBox
                cutSize={15}
                bg={isUploading ? "#555" : "var(--accent)"}
                className={styles.submitWrapper}
                hoverEffect={!isUploading}
                noPadding
                onClick={!isUploading ? handleUpload : undefined}
              >
                <button className={styles.submitBtn} disabled={isUploading}>
                  {isUploading ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />{" "}
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload size={16} /> Upload to Server
                    </>
                  )}
                </button>
              </ChamferBox>
            </div>
          </div>
        </ChamferBox>
      </div>
    </div>
  );
};

export default UploadModal;
