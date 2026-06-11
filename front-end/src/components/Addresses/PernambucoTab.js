import { AddressDirectory } from "./AddressDirectory";
import { compesa } from "./address";

const administrativeAddresses = [
  {
    title: "Guabiraba",
    key: "guabiraba",
    endereco:
      "Estr. da Mumbeca, 305 F - Guabiraba, Paulista - PE, CEP: 52490-005.",
    mapUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3575.739683888518!2d-34.92368222544322!3d-7.9657429793919!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x7ab17003c5bc3d9%3A0x5446820b7e1cc2b1!2sCD%20Cifra%20Engenharia%20%2F%20Guabiraba!5e1!3m2!1spt-BR!2sbr!4v1758636615643!5m2!1spt-BR!2sbr",
  },
  {
    title: "JAM",
    key: "jam",
    endereco:
      "Av. Dr. José Augusto Moreira, 900 - Casa Caiada, Olinda - PE, CEP: 53130-410.",
    mapUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3575.5475262500495!2d-34.84133642544281!3d-7.987716779656078!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x7ab3daa0352c327%3A0xc48545026b339a53!2sJAM%20Olinda%20-%20Jos%C3%A9%20Augusto%20Moreira!5e1!3m2!1spt-BR!2sbr!4v1758636694804!5m2!1spt-BR!2sbr",
  },
];

const sections = [
  {
    key: "administrative",
    title: "Galpão e Administrativo",
    items: administrativeAddresses,
  },
  {
    key: "compesa",
    title: "Compesa",
    items: compesa,
  },
];

export function PernambucoTab() {
  return (
    <AddressDirectory
      sections={sections}
      searchPlaceholder="Buscar endereço em Pernambuco"
    />
  );
}
