// Test file for manual verification of all transformation paths

// Test 1: Interface pattern (should offer type and inline)
interface DrawerPropsI {
  header: string;
  onClose: () => void;
}

function DrawerI({ header, onClose }: DrawerPropsI) {
  return <div>{header}</div>;
}

// Test 2: Type alias pattern (should offer interface and inline)
type DrawerPropsT = {
  header: string;
  onClose: () => void;
};

function DrawerT({ header, onClose }: DrawerPropsT) {
  return <div>{header}</div>;
}

// Test 3: Inline pattern (should offer interface and type)
function DrawerInline({ header, onClose }: { header: string; onClose: () => void }) {
  return <div>{header}</div>;
}

// Test 4: Generic interface
interface GenericProps<T> {
  data: T;
  render: (item: T) => JSX.Element;
}

function GenericComponent<T>({ data, render }: GenericProps<T>) {
  return <div>{render(data)}</div>;
}

// Test 5: Exported type (should not allow inline)
export type PublicProps = {
  visible: boolean;
};

function PublicComponent({ visible }: PublicProps) {
  return <>{visible && <div>Visible</div>}</>;
}

// Test 6: Shared type (should not allow inline)
type SharedProps = {
  id: string;
};

function ComponentA({ id }: SharedProps) {
  return <div>{id}</div>;
}

function ComponentB({ id }: SharedProps) {
  return <span>{id}</span>;
}

// Test 7: Arrow function component
const ArrowComponent = ({ title }: { title: string }) => {
  return <h1>{title}</h1>;
};

// Test 8: Interface with extends
interface BaseProps {
  className?: string;
}

interface ExtendedProps extends BaseProps {
  title: string;
}

function ExtendedComponent({ className, title }: ExtendedProps) {
  return <div className={className}>{title}</div>;
}
