// Props as Interface

interface DrawerPropsI {
  header: string;
}

function DrawerI({ header }: DrawerPropsI) {
  return <></>;
}

// Props as Type Alias

type DrawerPropsT = {
  header: string;
};

function DrawerT({ header }: DrawerPropsT) {
  return <></>;
}

// Props with Inline Object Literal

function Drawer({ header }: { header: string }) {
  return <></>;
}
