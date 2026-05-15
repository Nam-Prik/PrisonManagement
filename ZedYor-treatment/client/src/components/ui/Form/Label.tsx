import './Form.css'

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean
}

export default function Label({ required, children, className = '', ...props }: LabelProps) {
  const classes = ['form-label', required ? 'form-label--required' : '', className]
    .filter(Boolean)
    .join(' ')

  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: htmlFor is passed via props spread
    <label className={classes} {...props}>
      {children}
    </label>
  )
}
