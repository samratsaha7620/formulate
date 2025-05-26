import { useState, useEffect, useRef } from "react";
import DOMPurify from "dompurify";

function EditableFormTitle({
  value: initialValue,
  formTitleDebounced,
  formId,
}: {
  value: string;
  formTitleDebounced: (formId: string, title: string) => void;
  formId: string;
}) {
  const [value, setValue] = useState(initialValue);
  const contentRef = useRef<HTMLDivElement>(null);
  const isUpdatingRef = useRef(false);
  
  // Only initialize on first render
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.innerHTML = initialValue;
    }
  }, []);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    // Skip if we're in the middle of a programmatic update
    if (isUpdatingRef.current) return;
    
    const target = e.target as HTMLElement;
    const sanitizedHTML = DOMPurify.sanitize(target.innerHTML)
      .replace(/&nbsp;/g, " ")
      .trim();
    
    // Only update if changed
    if (sanitizedHTML !== value) {
      setValue(sanitizedHTML);
      formTitleDebounced(formId, sanitizedHTML);
    }
  };

  return (
    <div
      ref={contentRef}
      tabIndex={0}
      contentEditable
      suppressContentEditableWarning
      className={`${
        !value ? "before:content-['Type_form_title'] text-muted-foreground" : ""
      } break-words focus:outline-none text-5xl font-semibold tracking-tight transition-colors`}
      onInput={handleInput}
    />
  );
}

export default EditableFormTitle;