// كمبوننت بسيط يطبع الـ JSON-LD كوسم <script> حقيقي داخل HTML الخاص بالسيرفر (SSR)
// عشان جوجل يقرأه من أول طلب — بدل next/script اللي بيحقنه من جهة العميل.
export default function JsonLd({ id, data }) {
  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
