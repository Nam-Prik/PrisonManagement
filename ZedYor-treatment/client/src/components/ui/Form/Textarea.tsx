import './Form.css'

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
}

export default function Textarea({ error = false, className = '', ...props }: TextareaProps) {
  const classes = [
    'form-control',
    'form-control--textarea',
    error ? 'form-control--error' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return <textarea className={classes} {...props} />
}
