"use client";

import { useEffect, useRef, useState, useCallback } from "react";

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
  const quillRef = useRef<{
    setContents: (content: string) => void;
    getContents: () => string;
  } | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const tooltipsAddedRef = useRef(false);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // تحديث onChange ref عند تغييره
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // دالة لإضافة tooltips - مرة واحدة فقط
  const addTooltips = useCallback(() => {
    if (tooltipsAddedRef.current) return;

    const toolbar = editorRef.current?.querySelector(".ql-toolbar");
    if (!toolbar) return;

    tooltipsAddedRef.current = true;

    // قاموس الترجمة العربية
    const tooltips: Record<string, string> = {
      "ql-bold": "عريض - يجعل النص عريض",
      "ql-italic": "مائل - يجعل النص مائلاً",
      "ql-link": "رابط - يضيف رابط",
    };

    // إضافة tooltips للأزرار
    const buttons = toolbar.querySelectorAll("button");
    buttons.forEach((button) => {
      const buttonElement = button as HTMLElement;
      const classList = Array.from(buttonElement.classList);

      let tooltipText = "";

      // للقوائم
      if (classList.includes("ql-list")) {
        const value = buttonElement.getAttribute("value");
        if (value === "ordered") {
          tooltipText = "قائمة مرقمة - ينشئ قائمة مرقمة (1, 2, 3...)";
        } else if (value === "bullet") {
          tooltipText = "قائمة نقطية - ينشئ قائمة نقطية (• • •)";
        }
      }
      // للأدوات الأخرى
      else {
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

    // إضافة tooltips للـ pickers
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

    // تحميل Quill بشكل ديناميكي فقط في الـ client side
    const loadQuill = async () => {
      try {
        const Quill = (await import("quill")).default;
        await import("quill/dist/quill.snow.css");

        // إنشاء محرر Quill
        const quill = new Quill(editorRef.current!, {
          theme: "snow",
          placeholder: placeholder,
          modules: {
            toolbar: [
              [{ header: [1, 2, 3, false] }],
              ["bold", "italic"],
              [{ color: [] }, { background: [] }],
              [{ list: "ordered" }, { list: "bullet" }],
              ["link"],
            ],
          },
        });

        // تعيين المحتوى الأولي
        if (value) {
          quill.root.innerHTML = value;
        }

        // إعداد RTL للعربية
        const editorElement = quill.root;
        editorElement.setAttribute("dir", "rtl");
        editorElement.style.textAlign = "right";

        // إضافة tooltips بعد تحميل المحرر - مرة واحدة فقط
        setTimeout(() => {
          addTooltips();
        }, 300);

        // الاستماع للتغييرات
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

  // تحديث المحتوى عند تغيير value من الخارج
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
