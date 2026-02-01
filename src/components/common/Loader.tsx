import React, { CSSProperties } from "react";

interface LoaderProps {
  src: string;
  width?: number;
  height?: number;
  fullScreen?: boolean;
}

const Loader: React.FC<LoaderProps> = ({
  src,
  width = 120,
  height = 120,
  fullScreen = false,
}) => {
  return (
    <div style={fullScreen ? styles.fullScreen : styles.container}>
      <video
        src={src}
        autoPlay
        loop
        muted
        playsInline
        style={{ width, height }}
      />
    </div>
  );
};

const styles: {
  container: CSSProperties;
  fullScreen: CSSProperties;
} = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "120px",
  },
  fullScreen: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(255,255,255,0.8)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
};

export default Loader;
