import { AddressDirectory } from "./AddressDirectory";
import { alagoas } from "./address";

const sections = [
  {
    key: "alagoas",
    title: "Alagoas",
    items: alagoas,
  },
];

export function AlagoasTab() {
  return (
    <AddressDirectory
      sections={sections}
      searchPlaceholder="Buscar endereço em Alagoas"
    />
  );
}
