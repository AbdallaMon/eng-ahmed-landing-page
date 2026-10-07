"use client";
import { FileUploadField } from "@/app/register/component/forms/inputs/FileUploadField";

/**
 * Optional file attachment — thin wrapper over the existing `FileUploadField`
 * (which itself handles size validation + preview and writes `formData.file`
 * via the form's `setFormData`). The uploaded file is later sent through
 * `uploadInChunks` on submit. Presentation-agnostic: renders ONLY the field.
 *
 * @param {{ form: object }} props  `form` = the object returned by `useLeadForm`.
 */
export default function FileField({ form }) {
  const { translate, setFormData } = form;
  return (
    <FileUploadField
      label={translate("form.addAttachmentOptional")}
      id="file"
      setData={setFormData}
    />
  );
}
