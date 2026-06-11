import { AddressDirectory } from "./AddressDirectory";
import { sergipe } from "./address";

const sections = [
  {
    key: "sergipe",
    title: "Sergipe",
    items: sergipe,
  },
];

export function SergipeTab() {
  return (
    <AddressDirectory
      sections={sections}
      searchPlaceholder="Buscar endereço em Sergipe"
    />
  );
}
