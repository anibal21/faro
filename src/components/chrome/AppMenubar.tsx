import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarTrigger,
} from "../ui/menubar";

type AppMenubarProps = {
  theme: "light" | "dark";
  onTheme: (t: "light" | "dark") => void;
  onNew: () => void;
  onDisconnectAll: () => void;
  onOpenSecurity: () => void;
};

export function AppMenubar({
  theme,
  onTheme,
  onNew,
  onDisconnectAll,
  onOpenSecurity,
}: AppMenubarProps) {
  return (
    <Menubar aria-label="Principal" className="h-8 text-[13px]">
      <MenubarMenu>
        <MenubarTrigger>Ambientes</MenubarTrigger>
        <MenubarContent>
          <MenubarItem onSelect={onNew}>Nuevo…</MenubarItem>
          <MenubarItem onSelect={onDisconnectAll}>Desconectar todo</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Temas</MenubarTrigger>
        <MenubarContent>
          <MenubarRadioGroup
            value={theme}
            onValueChange={(v) => onTheme(v as "light" | "dark")}
          >
            <MenubarRadioItem value="light">Claro</MenubarRadioItem>
            <MenubarRadioItem value="dark">Oscuro</MenubarRadioItem>
          </MenubarRadioGroup>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Ayuda</MenubarTrigger>
        <MenubarContent>
          <MenubarItem onSelect={onOpenSecurity}>Seguridad</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}
