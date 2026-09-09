type ClassDictionary = Record<string, boolean | null | undefined>
type ClassValue =
  | string
  | number
  | ClassDictionary
  | ClassValue[]
  | false
  | null
  | undefined

function toClassString(input: ClassValue): string {
  if (!input) return ''

  if (typeof input === 'string' || typeof input === 'number') {
    return String(input)
  }

  if (Array.isArray(input)) {
    return input
      .reduce<string[]>((classes, value) => {
        const className = toClassString(value)
        if (className) classes.push(className)
        return classes
      }, [])
      .join(' ')
  }

  return Object.entries(input)
    .reduce<string[]>((classes, [key, isEnabled]) => {
      if (isEnabled) classes.push(key)
      return classes
    }, [])
    .join(' ')
}

export function cn(...inputs: ClassValue[]) {
  return inputs
    .reduce<string[]>((classes, input) => {
      const className = toClassString(input)
      if (className) classes.push(className)
      return classes
    }, [])
    .join(' ')
}
