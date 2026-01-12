import React, { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "../integrations/supabase/client";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export type SliderImage = {
  id: string; // ✅ FIXED
  title: string | null;
  description: string | null;
  image_url: string;
  display_order: number | null;
  is_active: boolean | null;
  created_at: string;
  updated_at: string;
};

const SWIPE_THRESHOLD = 60;

const Slider: React.FC = () => {
  const [images, setImages] = useState<SliderImage[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);

  const startX = useRef(0);
  const isDragging = useRef(false);

  const fetchImages = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("slider_images")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      setImages(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  // Auto slide
  useEffect(() => {
    if (!images.length) return;

    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [images]);

  const slideNext = () => {
    setCurrent((prev) => (prev + 1) % images.length);
  };

  const slidePrev = () => {
    setCurrent((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  // Touch handlers
  const onTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const diff = startX.current - e.changedTouches[0].clientX;
    if (diff > SWIPE_THRESHOLD) slideNext();
    if (diff < -SWIPE_THRESHOLD) slidePrev();
  };

  // Mouse handlers
  const onMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    startX.current = e.clientX;
  };

  const onMouseUp = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const diff = startX.current - e.clientX;
    if (diff > SWIPE_THRESHOLD) slideNext();
    if (diff < -SWIPE_THRESHOLD) slidePrev();
    isDragging.current = false;
  };

  const onMouseLeave = () => {
    isDragging.current = false;
  };

  if (loading)
    return (
      <div style={{ width: "100%", overflow: "hidden" }}>
        <Skeleton height={400} width="100%" borderRadius={8} count={1} />
      </div>
    );

  return (
    <div
      style={styles.container}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
    >
      <div
        style={{
          ...styles.track,
          transform: `translateX(-${current * 100}%)`,
        }}
      >
        {images.map((img) => (
          <div key={img.id} style={styles.slide}>
            <img src={img.image_url} alt="" style={styles.image} />
          </div>
        ))}
      </div>

      {/* Dots */}
      <div style={styles.dots}>
        {images.map((_, i) => (
          <span
            key={i}
            onClick={() => setCurrent(i)}
            style={{
              ...styles.dot,
              opacity: current === i ? 1 : 0.4,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default Slider;

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    width: "100%",
    overflow: "hidden",
    position: "relative",
    cursor: "grab",
  },
  track: {
    display: "flex",
    transition: "transform 0.5s ease",
  },
  slide: {
    minWidth: "100%",
    height: "clamp(300px, 40vw, 600px)",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    pointerEvents: "none",
    userSelect: "none",
  },
  dots: {
    position: "absolute",
    bottom: 12,
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    backgroundColor: "#fff",
    cursor: "pointer",
  },
};
