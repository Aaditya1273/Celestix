import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText as GSAPSplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, GSAPSplitText);

const SplitText = ({
  text,
  className = "",
  delay = 100,
  duration = 0.6,
  ease = "power3.out",
  splitType = "chars",
  from = { opacity: 0, y: 40 },
  to = { opacity: 1, y: 0 },
  threshold = 0.1,
  rootMargin = "-100px",
  textAlign = "center",
  onLetterAnimationComplete,
}) => {
  const ref = useRef(null);
  const splitterRef = useRef(null);
  const timelineRef = useRef(null);

  // Effect for splitting text, runs only when text or splitType changes
  useEffect(() => {
    if (typeof window === "undefined" || !ref.current || !text) return;

    const timeoutId = setTimeout(() => {
      const el = ref.current;
      if (!el) return;
      const absoluteLines = splitType === "lines";
      if (absoluteLines) el.style.position = "relative";

      try {
        splitterRef.current = new GSAPSplitText(el, {
          type: splitType,
          absolute: absoluteLines,
          linesClass: "split-line",
        });
      } catch (error) {
        console.error("Failed to create SplitText:", error);
      }
    }, 0); // Defer execution

    return () => {
      clearTimeout(timeoutId);
      if (splitterRef.current) {
        splitterRef.current.revert();
        splitterRef.current = null;
      }
    };
  }, [text, splitType]);

  // Effect for animation, runs when animation props change
  useEffect(() => {
    if (!splitterRef.current) return;

    const timeoutId = setTimeout(() => {
      const el = ref.current;
      if (!el) return;
      const splitter = splitterRef.current;

      let targets;
      switch (splitType) {
        case "lines": targets = splitter.lines; break;
        case "words": targets = splitter.words; break;
        default: targets = splitter.chars;
      }

      if (!targets || targets.length === 0) return;

      if (timelineRef.current) {
        timelineRef.current.kill();
      }

      targets.forEach((t) => { t.style.willChange = "transform, opacity"; });

      const startPct = (1 - threshold) * 100;
      const marginMatch = /^(-?\d+(?:\.\d+)?)(px|em|rem|%)?$/.exec(rootMargin);
      const marginValue = marginMatch ? parseFloat(marginMatch[1]) : 0;
      const marginUnit = marginMatch ? (marginMatch[2] || "px") : "px";
      const sign = marginValue < 0 ? `-=${Math.abs(marginValue)}${marginUnit}` : `+=${marginValue}${marginUnit}`;
      const start = `top ${startPct}%${sign}`;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start,
          toggleActions: "play none none none",
          once: true,
        },
        smoothChildTiming: true,
        onComplete: () => {
          gsap.set(targets, { clearProps: "willChange", immediateRender: false });
          onLetterAnimationComplete?.();
        },
      });

      tl.set(targets, { ...from, immediateRender: false, force3D: true });
      tl.to(targets, {
        ...to,
        duration,
        ease,
        stagger: delay / 1000,
        force3D: true,
      });

      timelineRef.current = tl;
    }, 100); // Defer execution slightly to ensure split is complete

    return () => {
      clearTimeout(timeoutId);
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
    };
  }, [delay, duration, ease, from, to, threshold, rootMargin, onLetterAnimationComplete, splitType, text]);

  return (
    <p
      ref={ref}
      className={`split-parent ${className}`}
      style={{
        textAlign,
        overflow: "hidden",
        display: "inline-block",
        whiteSpace: "normal",
        wordWrap: "break-word",
      }}
    >
      {text}
    </p>
  );
};

export default SplitText;
