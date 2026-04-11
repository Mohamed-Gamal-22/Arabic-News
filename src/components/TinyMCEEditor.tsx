"use client";

import { useEffect, useRef, useState, useCallback } from "react";

/** حد أقصى لصورة مضمّنة كـ base64 داخل HTML */
const MAX_INLINE_IMAGE_BYTES = 2 * 1024 * 1024;

interface TinyMCEEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function TinyMCEEditor({
  value,
  onChange,
  placeholder = "اكتب محتوى المقالة هنا...",
}: TinyMCEEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const quillRef = useRef<any>(null);
  const [isMounted, setIsMounted] = useState(false);
  const tooltipsAddedRef = useRef(false);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const addTooltips = useCallback(() => {
    if (tooltipsAddedRef.current) return;

    const toolbar = editorRef.current?.querySelector(".ql-toolbar");
    if (!toolbar) return;

    tooltipsAddedRef.current = true;

    const tooltips: Record<string, string> = {
      "ql-bold": "عريض - يجعل النص عريض",
      "ql-italic": "مائل - يجعل النص مائلاً",
      "ql-link":
        "رابط — يوتيوب، فيمو، منشور تويتر/إكس، أو أي رابط عادي (يفتح في تاب جديد)",
      "ql-image":
        "صورة داخل المقال — ارفع صورة من جهازك (حتى 2 ميجابايت)",
    };

    const buttons = toolbar.querySelectorAll("button");
    buttons.forEach((button) => {
      const buttonElement = button as HTMLElement;
      const classList = Array.from(buttonElement.classList);

      let tooltipText = "";

      if (classList.includes("ql-list")) {
        const val = buttonElement.getAttribute("value");
        if (val === "ordered") {
          tooltipText =
            "قائمة مرقمة - ينشئ قائمة مرقمة (1, 2, 3...)";
        } else if (val === "bullet") {
          tooltipText = "قائمة نقطية - ينشئ قائمة نقطية (• • •)";
        }
      } else {
        for (const [key, tooltip] of Object.entries(tooltips)) {
          if (classList.includes(key)) {
            tooltipText = tooltip;
            break;
          }
        }
      }

      if (tooltipText && !buttonElement.getAttribute("title")) {
        buttonElement.setAttribute("title", tooltipText);
        buttonElement.setAttribute("aria-label", tooltipText);
      }
    });

    const pickers = toolbar.querySelectorAll(".ql-picker");
    pickers.forEach((picker) => {
      const pickerElement = picker as HTMLElement;
      const pickerLabel = pickerElement.querySelector(".ql-picker-label");

      if (pickerLabel) {
        const labelElement = pickerLabel as HTMLElement;
        const classList = Array.from(pickerElement.classList);

        if (
          classList.includes("ql-header") &&
          !labelElement.getAttribute("title")
        ) {
          labelElement.setAttribute(
            "title",
            "العناوين - اختر حجم العنوان (عادي, H1, H2, H3)"
          );
        } else if (
          classList.includes("ql-color") &&
          !labelElement.getAttribute("title")
        ) {
          labelElement.setAttribute("title", "لون النص - اختر لون النص");
        } else if (
          classList.includes("ql-background") &&
          !labelElement.getAttribute("title")
        ) {
          labelElement.setAttribute("title", "لون الخلفية - اختر لون الخلفية");
        }
      }
    });
  }, []);

  useEffect(() => {
    if (!isMounted || !editorRef.current || quillRef.current) return;

    const loadQuill = async () => {
      try {
        const Quill = (await import("quill")).default;
        // @ts-expect-error - CSS import doesn't have type declarations
        await import("quill/dist/quill.snow.css");

        const quill = new Quill(editorRef.current!, {
          theme: "snow",
          placeholder: placeholder,
          modules: {
            toolbar: {
              container: [
                [{ header: [1, 2, 3, false] }],
                ["bold", "italic"],
                [{ color: [] }, { background: [] }],
                [{ list: "ordered" }, { list: "bullet" }],
                ["link", "image"],
              ],
              handlers: {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                image: function (this: any) {
                  const q = this.quill;
                  const input = document.createElement("input");
                  input.setAttribute("type", "file");
                  input.setAttribute(
                    "accept",
                    "image/jpeg,image/png,image/webp,image/gif"
                  );
                  input.click();
                  input.onchange = () => {
                    const file = input.files?.[0];
                    if (!file) return;
                    if (file.size > MAX_INLINE_IMAGE_BYTES) {
                      window.alert(
                        `حجم الصورة يجب ألا يتجاوز ${MAX_INLINE_IMAGE_BYTES / (1024 * 1024)} ميجابايت.`
                      );
                      return;
                    }
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      const dataUrl = ev.target?.result;
                      if (typeof dataUrl !== "string") return;
                      const range = q.getSelection(true);
                      const idx = range ? range.index : q.getLength();
                      q.insertEmbed(idx, "image", dataUrl, "user");
                      q.setSelection(idx + 1, 0, "silent");
                    };
                    reader.readAsDataURL(file);
                  };
                },
              },
            },
          },
        });

        if (value) {
          quill.root.innerHTML = value;
        }

        const editorElement = quill.root;
        editorElement.setAttribute("dir", "rtl");
        editorElement.style.textAlign = "right";

        setTimeout(() => {
          addTooltips();
        }, 300);

        quill.on("text-change", () => {
          const content = quill.root.innerHTML;
          onChangeRef.current(content);
        });

        quillRef.current = quill;
      } catch (error: unknown) {
        console.error("Error loading Quill:", error);
      }
    };

    loadQuill();

    return () => {
      if (quillRef.current) {
        quillRef.current.off("text-change");
        quillRef.current = null;
      }
      tooltipsAddedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMounted, placeholder, addTooltips]);

  useEffect(() => {
    if (quillRef.current && value !== quillRef.current.root.innerHTML) {
      quillRef.current.root.innerHTML = value;
    }
  }, [value]);

  if (!isMounted) {
    return (
      <div className="arabic-text">
        <div
          style={{
            minHeight: "400px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            padding: "12px",
            backgroundColor: "#fff",
          }}
        >
          <p className="text-gray-500">جاري تحميل المحرر...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="arabic-text">
      <div
        ref={editorRef}
        style={{
          minHeight: "400px",
        }}
      />
    </div>
  );
}
