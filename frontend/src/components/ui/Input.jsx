import "./Input.css";

export function Field({ label, error, children }) {
  return (
    <label className="field">
      <span className="field-label mono">{label}</span>
      {children}
      {error && <span className="field-error mono">{error}</span>}
    </label>
  );
}

export function Input(props) {
  return <input className="input" {...props} />;
}

export function Select({ children, ...props }) {
  return (
    <select className="input" {...props}>
      {children}
    </select>
  );
}
