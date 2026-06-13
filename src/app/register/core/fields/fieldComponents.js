// Maps a field id (from `leadFormFieldOrder`) to its presentation-agnostic
// field component, so a variant can render the form by mapping over the ordered
// id list:
//
//   import { FIELD_COMPONENTS } from "@/app/register/core/fields/fieldComponents";
//   import { leadFormFieldOrder } from "@/app/register/core/fields/fieldOrder";
//   ...
//   leadFormFieldOrder({ location, hasCapturedEmail }).map((id) => {
//     const Field = FIELD_COMPONENTS[id];
//     return <MyAnimatedWrapper key={id}><Field form={form} /></MyAnimatedWrapper>;
//   });
//
// This is an explicit lookup utility, NOT a re-export barrel — each field still
// has its own file and can be imported directly when a variant wants bespoke
// placement (e.g. name + phone on one row).

import NameField from "@/app/register/core/fields/NameField";
import PhoneField from "@/app/register/core/fields/PhoneField";
import EmailField from "@/app/register/core/fields/EmailField";
import EmirateField from "@/app/register/core/fields/EmirateField";
import DescriptionField from "@/app/register/core/fields/DescriptionField";
import CountryField from "@/app/register/core/fields/CountryField";
import SourceField from "@/app/register/core/fields/SourceField";
import FileField from "@/app/register/core/fields/FileField";

export const FIELD_COMPONENTS = {
  name: NameField,
  phone: PhoneField,
  email: EmailField,
  emirate: EmirateField,
  description: DescriptionField,
  country: CountryField,
  source: SourceField,
  file: FileField,
};

export default FIELD_COMPONENTS;
